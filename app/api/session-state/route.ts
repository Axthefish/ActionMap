import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sessions, blueprints } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
  if (!session) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  const [bp] = await db.select().from(blueprints).where(eq(blueprints.sessionId, id));
  const session_state = {
    session_id: session.id,
    blueprint_definition: {
      main_path: (bp?.mainPath as any) ?? [],
      milestone_nodes: (bp?.milestoneNodes as any) ?? [],
    },
    current_position: session.currentPosition,
    active_cycle_index: session.activeCycleIndex,
    last_assessment_narrative: session.lastAssessmentNarrative,
  };
  return new Response(JSON.stringify({ session_state }), { headers: { 'Content-Type': 'application/json' } });
}


