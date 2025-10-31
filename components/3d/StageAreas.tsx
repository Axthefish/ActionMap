'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
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

  return (
    <group>
      {segments.map((s, i) => (
        <group key={`stage-area-${i}`} position={[(s.startX + s.endX) / 2, 0, 0]}>
          {/* Semi-transparent area rectangle behind the path */}
          <mesh position={[0, 0.35, -0.05]}>
            <planeGeometry args={[s.endX - s.startX, 1.6]} />
            <meshBasicMaterial
              color={getAreaColor(s.status)}
              transparent
              opacity={getAreaOpacity(s.status)}
            />
          </mesh>

          {/* Boundary lines of the region */}
          <mesh position={[-(s.endX - s.startX) / 2, 0.35, -0.04]}>
            <boxGeometry args={[0.02, 1.6, 0.02]} />
            <meshBasicMaterial color={getBorderColor(s.status)} opacity={0.6} transparent />
          </mesh>
          <mesh position={[(s.endX - s.startX) / 2, 0.35, -0.04]}>
            <boxGeometry args={[0.02, 1.6, 0.02]} />
            <meshBasicMaterial color={getBorderColor(s.status)} opacity={0.6} transparent />
          </mesh>

          {/* Edge text: show core objective at the top edge to avoid clutter */}
          {s.content?.core_objective && (
            <Text
              position={[0, 1.3, 0]}
              fontSize={0.22}
              color={s.status === 'current' ? '#ffffff' : '#cbd5e1'}
              anchorX="center"
              anchorY="middle"
              maxWidth={(s.endX - s.startX) * 0.9}
              outlineWidth={s.status === 'current' ? 0.02 : 0.01}
              outlineColor={s.status === 'current' ? '#00d4ff' : '#000'}
            >
              {s.content.core_objective}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
}

function getAreaColor(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'current':
      return '#00d4ff';
    case 'future':
    default:
      return '#64748b';
  }
}

function getAreaOpacity(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return 0.12;
    case 'current':
      return 0.18;
    case 'future':
    default:
      return 0.08;
  }
}

function getBorderColor(status: ComputedSegment['status']) {
  switch (status) {
    case 'completed':
      return '#34d399';
    case 'current':
      return '#22d3ee';
    case 'future':
    default:
      return '#94a3b8';
  }
}


