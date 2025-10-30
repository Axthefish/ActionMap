'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MilestoneNode as MilestoneNodeType } from '@/lib/types';
import { useBlueprintStore } from '@/lib/store/blueprintStore';
import * as THREE from 'three';

interface MilestoneNodeProps {
  position: [number, number, number];
  node: MilestoneNodeType;
}

export default function MilestoneNode({ position, node }: MilestoneNodeProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const setInfoCardData = useBlueprintStore((state) => state.setInfoCardData);
  
  // Hover animation
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  const handleClick = () => {
    setInfoCardData({
      label: node.label,
      content: node.content,
      position,
    });
  };
  
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? '#00d4ff' : '#60a5fa'}
        emissive={hovered ? '#00d4ff' : '#3b82f6'}
        emissiveIntensity={hovered ? 0.8 : 0.4}
      />
    </mesh>
  );
}

