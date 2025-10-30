import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sessions, blueprints, actionCycles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runStrategyCycle } from '@/lib/ai';
import { CycleRequest, SessionState } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: CycleRequest = await req.json();
    const { session_id, user_observations } = body;
    
    if (!session_id || !user_observations) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: session_id and user_observations are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[API /cycle] Processing cycle for session:', session_id);
    
    // Fetch session and blueprint from database
    const [session] = await db.select().from(sessions).where(eq(sessions.id, session_id));
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.sessionId, session_id));
    
    if (!blueprint) {
      return new Response(
        JSON.stringify({ error: 'Blueprint not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const previousPosition = session.currentPosition;
    
    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Construct session state for AI
          const sessionState: SessionState = {
            session_id: session.id,
            blueprint_definition: {
              main_path: blueprint.mainPath as any,
              milestone_nodes: blueprint.milestoneNodes as any,
            },
            current_position: session.currentPosition,
            active_cycle_index: session.activeCycleIndex,
            last_assessment_narrative: session.lastAssessmentNarrative,
          };
          
          // Run AI strategy cycle (subsequent cycle - progress update)
          const aiResponse = await runStrategyCycle(sessionState, user_observations, false);
          
          const { visual_engine_commands, narrative } = aiResponse;
          const { new_arrow_position, new_action_lines_to_draw } = visual_engine_commands.payload;
          
          // Update session in database
          const newCycleIndex = session.activeCycleIndex + 1;
          
          await db
            .update(sessions)
            .set({
              currentPosition: new_arrow_position,
              activeCycleIndex: newCycleIndex,
              lastAssessmentNarrative: narrative,
              updatedAt: new Date(),
            })
            .where(eq(sessions.id, session_id));
          
          // Save action cycle record
          await db.insert(actionCycles).values({
            sessionId: session_id,
            cycleIndex: newCycleIndex,
            userObservations: user_observations,
            assessmentNarrative: narrative,
            previousPosition: previousPosition,
            newPosition: new_arrow_position,
            actionLines: new_action_lines_to_draw,
          });
          
          console.log('[API /cycle] Cycle completed successfully, new position:', new_arrow_position);
          
          // Send visual commands first
          const commandData = JSON.stringify({
            type: 'commands',
            data: visual_engine_commands
          });
          controller.enqueue(encoder.encode(`data: ${commandData}\n\n`));
          
          // Stream narrative text
          const words = narrative.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words.slice(0, i + 1).join(' ');
            const textData = JSON.stringify({
              type: 'narrative',
              text: chunk,
              isComplete: i === words.length - 1
            });
            controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
          
        } catch (error) {
          console.error('[API /cycle] Stream error:', error);
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
    console.error('[API /cycle] Error:', error);
    
    if (error instanceof Error && error.message.includes('AI generation failed')) {
      return new Response(
        JSON.stringify({ error: 'Failed to process cycle', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
