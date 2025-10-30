'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface ProgressArrowProps {
  position: number; // 0.0 to 1.0
}

export default function ProgressArrow({ position }: ProgressArrowProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pathLength = 10;
  
  // Animated position
  const { animatedPosition } = useSpring({
    animatedPosition: position,
    config: { tension: 120, friction: 14 },
  });
  
  // Floating animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 0.5;
    }
  });
  
  return (
    <animated.group
      ref={groupRef}
      position-x={animatedPosition.to((p) => -pathLength / 2 + p * pathLength)}
    >
      {/* Arrow cone pointing down */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Glowing ring around arrow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial
          color="#ff6b6b"
          opacity={0.3}
          transparent
        />
      </mesh>
    </animated.group>
  );
}

