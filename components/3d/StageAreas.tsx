'use client';

import { useMemo } from 'react';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BlueprintDefinition, MilestoneNode } from '@/lib/types';

interface StageAreasProps {
  blueprintDefinition: BlueprintDefinition;
  currentPosition: number;
}

interface ComputedSegment {
  startX: number;
  endX: number;
  status: 'completed' | 'current' | 'future';
  stageName: string;
  content: MilestoneNode['content'] | null;
}

export default function StageAreas({ blueprintDefinition, currentPosition }: StageAreasProps) {
  const { main_path, milestone_nodes } = blueprintDefinition;
  const pathLength = 10; // Keep consistent with MainPath
  const segmentLength = pathLength / Math.max(1, main_path.length);

  // Map milestone content by label for easy lookup (label usually equals stage name)
  const contentByStage = useMemo(() => {
    const map = new Map<string, MilestoneNode['content']>();
    milestone_nodes.forEach((n) => {
      map.set(n.label, n.content);
    });
    return map;
  }, [milestone_nodes]);

  const segments: ComputedSegment[] = useMemo(() => {
    return main_path.map((seg, index) => {
      const startX = -pathLength / 2 + index * segmentLength;
      const endX = startX + segmentLength;
      const segmentStart = index / main_path.length;
      const segmentEnd = (index + 1) / main_path.length;
      let status: 'completed' | 'current' | 'future' = 'future';
      if (currentPosition > segmentEnd) status = 'completed';
      else if (currentPosition >= segmentStart && currentPosition <= segmentEnd) status = 'current';
      const content = contentByStage.get(seg.stage_name) ?? null;
      return { startX, endX, status, stageName: seg.stage_name, content };
    });
  }, [main_path, currentPosition, segmentLength, contentByStage]);

  const areaDepth = 1.6;
  return (
    <group>
      {segments.map((s, i) => (
        <group key={`stage-area-${i}`} position={[(s.startX + s.endX) / 2, 0, 0]}>
          {/* Flat area on ground (XZ plane) for top-down view */}
          <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[s.endX - s.startX, areaDepth]} />
            <meshBasicMaterial
              color={getAreaColor(s.status)}
              transparent
              opacity={getAreaOpacity(s.status)}
              depthWrite={false}
            />
          </mesh>

          {/* Boundary lines along Z (visible from top) */}
          <mesh position={[-(s.endX - s.startX) / 2, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.02, areaDepth]} />
            <meshBasicMaterial color={getBorderColor(s.status)} opacity={0.7} transparent depthWrite={false} />
          </mesh>
          <mesh position={[(s.endX - s.startX) / 2, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.02, areaDepth]} />
            <meshBasicMaterial color={getBorderColor(s.status)} opacity={0.7} transparent depthWrite={false} />
          </mesh>

          {/* Edge text at the top side of area (Html overlay for crispness) */}
          {s.content?.core_objective && (
            <Html position={[0, 0.02, areaDepth / 2 + 0.12]} sprite distanceFactor={12} zIndexRange={[9, 0]}>
              <div className="rounded-md border border-white/10 bg-slate-900/70 backdrop-blur px-2.5 py-1.5 text-[11px] text-slate-100 shadow">
                {s.content.core_objective}
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Inflection markers at boundaries between stages */}
      {segments.slice(0, -1).map((s, i) => (
        <group key={`infl-${i}`} position={[s.endX, 0.02, 0]}>
          {/* glow ring on ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.24, 48]} />
            <meshBasicMaterial color={'#fbbf24'} transparent opacity={0.9} depthWrite={false} />
          </mesh>
          {/* inner dot */}
          <mesh position={[0, 0.002, 0]}>
            <circleGeometry args={[0.06, 24]} />
            <meshBasicMaterial color={'#fde68a'} />
          </mesh>
          {/* label */}
          <Html position={[0, 0.02, 0.35]} sprite distanceFactor={12}>
            <div className="text-[11px] px-1.5 py-[2px] rounded bg-amber-400/20 text-amber-200 border border-amber-300/30">变化节点</div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function getAreaColor(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return '#4ade80';
    case 'current':
      return '#60a5fa';
    case 'future':
    default:
      return '#475569';
  }
}

function getAreaOpacity(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return 0.10;
    case 'current':
      return 0.14;
    case 'future':
    default:
      return 0.06;
  }
}

function getBorderColor(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return '#a7f3d0';
    case 'current':
      return '#93c5fd';
    case 'future':
    default:
      return '#94a3b8';
  }
}


