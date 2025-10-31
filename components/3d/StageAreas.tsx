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
          <mesh position={[0, 0.32, -0.05]}> 
            <planeGeometry args={[s.endX - s.startX, 1.6]} />
            <meshBasicMaterial
              color={getAreaColor(s.status)}
              transparent
              opacity={getAreaOpacity(s.status)}
              depthWrite={false}
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
              position={[0, 1.25, -0.02]}
              fontSize={0.16}
              color={'#e5e7eb'}
              anchorX="center"
              anchorY="middle"
              maxWidth={(s.endX - s.startX) * 0.9}
              outlineWidth={0.008}
              outlineColor={'#111827'}
            >
              {s.content.core_objective}
            </Text>
          )}
        </group>
      ))}

      {/* Inflection markers at boundaries between stages */}
      {segments.slice(0, -1).map((s, i) => (
        <group key={`infl-${i}`} position={[s.endX, 0.9, 0]}>
          {/* glow ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.23, 32]} />
            <meshBasicMaterial color={'#fbbf24'} transparent opacity={0.8} depthWrite={false} />
          </mesh>
          {/* inner dot */}
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={'#fde68a'} />
          </mesh>
          {/* label */}
          <Text position={[0, 0.35, 0]} fontSize={0.16} color={'#fde68a'} anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor={'#111827'}>
            变化节点
          </Text>
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


