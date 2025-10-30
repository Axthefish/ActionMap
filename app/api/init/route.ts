import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sessions, blueprints } from '@/lib/db/schema';
import { generateBlueprint, handleAIError } from '@/lib/ai';
import { generateSessionId, generateBlueprintId } from '@/lib/utils';
import { InitRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: InitRequest = await req.json();
    const { userGoal } = body;
    
    if (!userGoal || typeof userGoal !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: userGoal is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[API /init] Generating blueprint for goal:', userGoal);
    
    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate blueprint using AI
          const aiResponse = await generateBlueprint(userGoal);
          
          // Extract data from AI response
          const { visual_engine_commands, narrative } = aiResponse;
          const { blueprint_definition, initial_hypothesis } = visual_engine_commands.payload;
          
          // Generate IDs
          const sessionId = generateSessionId();
          const blueprintId = generateBlueprintId();
          
          // Save to database
          await db.insert(sessions).values({
            id: sessionId,
            userId: null,
            currentPosition: initial_hypothesis.suggested_position_on_path,
            activeCycleIndex: 0,
            lastAssessmentNarrative: null,
            blueprintId: blueprintId,
          });
          
          await db.insert(blueprints).values({
            id: blueprintId,
            sessionId: sessionId,
            mainPath: blueprint_definition.main_path as any,
            milestoneNodes: blueprint_definition.milestone_nodes as any,
            initialHypothesis: initial_hypothesis as any,
          });
          
          console.log('[API /init] Blueprint created successfully, session:', sessionId);
          
          // Send blueprint data first (for immediate 3D rendering)
          const blueprintData = JSON.stringify({
            type: 'blueprint',
            data: {
              visual_engine_commands,
              session_id: sessionId,
            }
          });
          controller.enqueue(encoder.encode(`data: ${blueprintData}\n\n`));
          
          // Stream narrative text with typing effect
          const words = narrative.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words.slice(0, i + 1).join(' ');
            const textData = JSON.stringify({
              type: 'narrative',
              text: chunk,
              isComplete: i === words.length - 1
            });
            controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
            
            // Small delay for typing effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
          
        } catch (error) {
          console.error('[API /init] Error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Internal server error'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('[API /init] Error:', error);
    
    if (error instanceof Error && error.message.includes('AI generation failed')) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate blueprint', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
