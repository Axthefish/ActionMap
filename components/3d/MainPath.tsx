'use client';

import { useMemo } from 'react';
import { BlueprintDefinition } from '@/lib/types';
import { Line } from '@react-three/drei';
import MilestoneNode from './MilestoneNode';
import * as THREE from 'three';

interface MainPathProps {
  blueprintDefinition: BlueprintDefinition;
  currentPosition: number;
}

export default function MainPath({ blueprintDefinition, currentPosition }: MainPathProps) {
  const { main_path, milestone_nodes } = blueprintDefinition;
  
  // Calculate total path length and segment positions
  const pathLength = 10; // Total length in 3D space
  const segmentLength = pathLength / main_path.length;
  
  // Generate path segments
  const segments = useMemo(() => {
    return main_path.map((segment, index) => {
      const startX = -pathLength / 2 + index * segmentLength;
      const endX = startX + segmentLength;
      const isCurrent = currentPosition >= index / main_path.length && 
                       currentPosition < (index + 1) / main_path.length;
      
      return {
        segment,
        start: new THREE.Vector3(startX, 0, 0),
        end: new THREE.Vector3(endX, 0, 0),
        isCurrent,
      };
    });
  }, [main_path, currentPosition, pathLength, segmentLength]);
  
  return (
    <group>
      {/* Draw path segments */}
      {segments.map((seg, idx) => (
        <Line
          key={seg.segment.segment_id}
          points={[seg.start, seg.end]}
          color={seg.isCurrent ? '#00d4ff' : '#4a5568'}
          lineWidth={seg.isCurrent ? 3 : 2}
          opacity={seg.isCurrent ? 1 : 0.4}
          transparent
        />
      ))}
      
      {/* Draw milestone nodes */}
      {milestone_nodes.map((node, idx) => {
        const xPos = -pathLength / 2 + node.position_on_path * pathLength;
        return (
          <MilestoneNode
            key={`milestone-${idx}`}
            position={[xPos, 0, 0]}
            node={node}
          />
        );
      })}
    </group>
  );
}

