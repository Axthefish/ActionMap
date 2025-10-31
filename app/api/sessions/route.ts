import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';

export async function GET(_req: NextRequest) {
  const rows = await db.select().from(sessions).orderBy(sessions.updatedAt as any).then((r: any) => r.reverse());
  const mapped = rows.map((s: any) => ({
    id: s.id,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    currentPosition: s.currentPosition,
    activeCycleIndex: s.activeCycleIndex,
  }));
  return new Response(JSON.stringify({ sessions: mapped }), { headers: { 'Content-Type': 'application/json' } });
}


