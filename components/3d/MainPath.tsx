'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { BlueprintDefinition } from '@/lib/types';
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
  
  // Generate path segments with status
  const contentByStage = useMemo(() => {
    const map = new Map<string, { key_signals: string[] }>();
    milestone_nodes.forEach((n) => {
      map.set(n.label, { key_signals: n.content.key_signals });
    });
    return map;
  }, [milestone_nodes]);

  const segments = useMemo(() => {
    return main_path.map((segment, index) => {
      const startX = -pathLength / 2 + index * segmentLength;
      const endX = startX + segmentLength;
      const segmentStart = index / main_path.length;
      const segmentEnd = (index + 1) / main_path.length;
      
      let status: 'completed' | 'current' | 'future';
      if (currentPosition > segmentEnd) {
        status = 'completed';
      } else if (currentPosition >= segmentStart && currentPosition <= segmentEnd) {
        status = 'current';
      } else {
        status = 'future';
      }
      
      return {
        segment,
        start: new THREE.Vector3(startX, 0, 0),
        end: new THREE.Vector3(endX, 0, 0),
        status,
        keySignals: contentByStage.get(segment.stage_name)?.key_signals ?? [],
      };
    });
  }, [main_path, currentPosition, pathLength, segmentLength, contentByStage]);
  
  return (
    <group>
      {/* Draw path segments with enhanced materials */}
      {segments.map((seg, idx) => (
        <PathSegment
          key={seg.segment.segment_id}
          start={seg.start}
          end={seg.end}
          status={seg.status}
          keySignals={seg.keySignals}
        />
      ))}
      
      {/* Stage labels above each segment */}
      {segments.map((seg) => (
        <Text
          key={`label-${seg.segment.segment_id}`}
          position={[ (seg.start.x + seg.end.x) / 2, 1.1, 0 ]}
          fontSize={0.35}
          color={seg.status === 'current' ? '#fff' : '#cbd5e1'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={seg.status === 'current' ? 0.02 : 0.01}
          outlineColor={seg.status === 'current' ? '#00d4ff' : '#000'}
        >
          {seg.segment.stage_name}
        </Text>
      ))}

      {/* Separators between stages to emphasize phase boundaries */}
      {segments.slice(0, -1).map((seg) => (
        <mesh key={`sep-${seg.segment.segment_id}`} position={[seg.end.x, 0.6, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.4, 12]} />
          <meshStandardMaterial color="#64748b" emissive="#64748b" emissiveIntensity={0.2} transparent opacity={0.7} />
        </mesh>
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

interface PathSegmentProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  status: 'completed' | 'current' | 'future';
  keySignals: string[];
}

function PathSegment({ start, end, status, keySignals }: PathSegmentProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Pulsating animation for current segment
  useFrame(({ clock }) => {
    if (meshRef.current && status === 'current') {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.3 + 0.9;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 1.2;
    }
    
    if (glowRef.current && status === 'current') {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.2 + 0.8;
      glowRef.current.scale.setScalar(pulse);
    }
  });
  
  // Calculate segment geometry
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  // Rotation to align cylinder with segment
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  // Material properties based on status
  const getMaterial = () => {
    switch (status) {
      case 'current':
        return {
          color: '#00d4ff',
          emissive: '#00d4ff',
          emissiveIntensity: 1.2,
          opacity: 1,
          metalness: 0.3,
          roughness: 0.4,
        };
      case 'completed':
        return {
          color: '#10b981',
          emissive: '#10b981',
          emissiveIntensity: 0.4,
          opacity: 0.8,
          metalness: 0.2,
          roughness: 0.5,
        };
      case 'future':
      default:
        return {
          color: '#4a5568',
          emissive: '#4a5568',
          emissiveIntensity: 0.1,
          opacity: 0.3,
          metalness: 0.1,
          roughness: 0.7,
        };
    }
  };
  
  const material = getMaterial();
  
  return (
    <group position={center} quaternion={quaternion}>
      {/* Main glowing tube */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.06, 0.06, length, 16]} />
        <meshStandardMaterial
          {...material}
          transparent
        />
      </mesh>
      
      {/* Outer glow (only for current segment) */}
      {status === 'current' && (
        <mesh ref={glowRef}>
          <cylinderGeometry args={[0.12, 0.12, length, 16]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Stage key signals rendered inside the segment */}
      {keySignals.slice(0, 3).map((signal, i, arr) => {
        // Spread texts along the segment's local Y axis
        const t = (i + 1) / (arr.length + 1); // (0,1)
        const y = -length / 2 + t * length; // local Y coord
        const color = status === 'current' ? '#ffffff' : status === 'completed' ? '#d1fae5' : '#94a3b8';
        const outline = status === 'current' ? '#00d4ff' : '#000000';
        return (
          <Billboard key={`ks-${i}`} position={[0, y, 0]}>
            <Text
              fontSize={0.18}
              color={color}
              anchorX="center"
              anchorY="middle"
              maxWidth={1.2}
              outlineWidth={status === 'current' ? 0.02 : 0.01}
              outlineColor={outline}
            >
              {signal}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}
