'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { ActionLine } from '@/lib/types';
import { useBlueprintStore } from '@/lib/store/blueprintStore';
import * as THREE from 'three';

interface ActionLinesProps {
  actionLines: ActionLine[];
  arrowPosition: number;
}

export default function ActionLines({ actionLines, arrowPosition }: ActionLinesProps) {
  const pathLength = 10;
  const xPos = -pathLength / 2 + arrowPosition * pathLength;
  
  return (
    <group position={[xPos, 0.5, 0]}>
      {actionLines.map((line, idx) => (
        <ActionLineBranch
          key={line.line_id}
          line={line}
          index={idx}
          totalCount={actionLines.length}
        />
      ))}
    </group>
  );
}

interface ActionLineBranchProps {
  line: ActionLine;
  index: number;
  totalCount: number;
}

function ActionLineBranch({ line, index, totalCount }: ActionLineBranchProps) {
  const [hovered, setHovered] = useState(false);
  const [growProgress, setGrowProgress] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  const setSelectedActionLineId = useBlueprintStore((state) => state.setSelectedActionLineId);
  const selectedId = useBlueprintStore((state) => state.selectedActionLineId);
  
  const isSelected = selectedId === line.line_id;
  
  // Grow animation on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setGrowProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    // Stagger the animation based on index
    setTimeout(() => {
      animate();
    }, index * 200);
  }, [index]);
  
  // Calculate branch direction
  const angle = (index - (totalCount - 1) / 2) * (Math.PI / 6); // Spread lines
  const length = 2;
  const endX = Math.sin(angle) * length * growProgress;
  const endY = Math.cos(angle) * length * growProgress;
  
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(endX, endY, 0),
  ];
  
  const handleClick = () => {
    setSelectedActionLineId(line.line_id);
  };
  
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  // Color based on style
  const getColor = () => {
    if (isSelected) return '#00ff88';
    if (hovered) return '#00d4ff';
    
    switch (line.style) {
      case 'urgent':
        return '#ff6b6b';
      case 'experimental':
        return '#ffd93d';
      case 'suggestion':
      default:
        return '#60a5fa';
    }
  };
  
  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={getColor()}
        lineWidth={isSelected ? 4 : hovered ? 3 : 2}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* End point marker */}
      {growProgress > 0.8 && (
        <mesh
          position={[endX, endY, 0]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

