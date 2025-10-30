'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
      };
    });
  }, [main_path, currentPosition, pathLength, segmentLength]);
  
  return (
    <group>
      {/* Draw path segments with enhanced materials */}
      {segments.map((seg, idx) => (
        <PathSegment
          key={seg.segment.segment_id}
          start={seg.start}
          end={seg.end}
          status={seg.status}
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

interface PathSegmentProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  status: 'completed' | 'current' | 'future';
}

function PathSegment({ start, end, status }: PathSegmentProps) {
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
    </group>
  );
}

