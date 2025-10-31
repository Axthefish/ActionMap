'use client';

import { useMemo } from 'react';
import { Html, Text } from '@react-three/drei';
import { BlueprintDefinition, MilestoneNode } from '@/lib/types';

interface StageSideContentProps {
  blueprintDefinition: BlueprintDefinition;
  currentPosition: number;
}

interface ComputedStage {
  startX: number;
  endX: number;
  index: number;
  isCurrent: boolean;
  stageName: string;
  content: MilestoneNode['content'] | null;
}

export default function StageSideContent({ blueprintDefinition, currentPosition }: StageSideContentProps) {
  const { main_path, milestone_nodes } = blueprintDefinition;
  const pathLength = 10;
  const segmentLength = pathLength / Math.max(1, main_path.length);

  const contentByStage = useMemo(() => {
    const m = new Map<string, MilestoneNode['content']>();
    milestone_nodes.forEach((n) => m.set(n.label, n.content));
    return m;
  }, [milestone_nodes]);

  const stages: ComputedStage[] = useMemo(() => {
    return main_path.map((seg, idx) => {
      const startX = -pathLength / 2 + idx * segmentLength;
      const endX = startX + segmentLength;
      const s = idx / main_path.length;
      const e = (idx + 1) / main_path.length;
      const isCurrent = currentPosition >= s && currentPosition <= e;
      return {
        startX,
        endX,
        index: idx,
        isCurrent,
        stageName: seg.stage_name,
        content: contentByStage.get(seg.stage_name) ?? null,
      };
    });
  }, [main_path, segmentLength, currentPosition, contentByStage]);

  return (
    <group>
      {stages.map((stg) => {
        const centerX = (stg.startX + stg.endX) / 2;
        const side = stg.index % 2 === 0 ? 1 : -1; // alternate sides
        const panelZ = 1.0 * side; // push away from path
        const linkZ = 0.0; // boundary anchor at path plane
        const y = 1.0;
        const width = stg.endX - stg.startX;
        const maxSignals = stg.isCurrent ? 4 : 2;
        const signals = stg.content?.key_signals?.slice(0, maxSignals) ?? [];

        return (
          <group key={`side-${stg.index}`}>
            {/* connector from region boundary to the side panel */}
            <mesh position={[stg.index % 2 === 0 ? stg.endX : stg.startX, y, (panelZ + linkZ) / 2]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.01, 0.01, Math.abs(panelZ - linkZ)]} />
              <meshBasicMaterial color="#93c5fd" transparent opacity={0.6} depthWrite={false} />
            </mesh>

            {/* side panel with Html for crisp text */}
            <Html
              position={[centerX, y, panelZ]}
              sprite
              distanceFactor={12}
              transform={false}
              zIndexRange={[10, 0]}
            >
              <div className="rounded-md border border-white/10 bg-slate-900/50 backdrop-blur px-3 py-2 text-xs text-slate-100 shadow-lg">
                <div className="font-medium text-slate-200 mb-1">{stg.stageName}</div>
                {stg.content?.core_objective && (
                  <div className="mb-1 text-[11px] text-slate-300/90 leading-snug">
                    {stg.content.core_objective}
                  </div>
                )}
                {signals.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-[280px]">
                    {signals.map((s, i) => (
                      <span key={i} className="rounded bg-sky-500/20 text-sky-100/90 border border-sky-400/30 px-2 py-[2px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}


