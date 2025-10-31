'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface ProgressArrowProps {
  position: number; // 0.0 to 1.0
}

export default function ProgressArrow({ position }: ProgressArrowProps) {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const pathLength = 10;
  
  // Animated position with smooth easing
  const { animatedPosition } = useSpring({
    animatedPosition: position,
    config: { tension: 80, friction: 20 }, // Slower, smoother
  });
  
  // Trail particles
  const trailParticles = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -i * 0.05; // Trail behind
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      opacities[i] = 1 - i / count; // Fade out
    }
    
    return { positions, opacities };
  }, []);
  
  // Subtle animation (top-down mode keeps arrow close to the ground plane)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (groupRef.current) {
      const floatY = Math.sin(time * 1.2) * 0.02;
      groupRef.current.position.y = 0.08 + floatY;
    }
    
    // Trail animation
    if (trailRef.current) {
      const geometry = trailRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 2] = Math.sin(time * 3 + i * 0.2) * 0.02; // wiggle sideways in plane
      }
      geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <animated.group
      ref={groupRef}
      position-x={animatedPosition.to((p) => -pathLength / 2 + p * pathLength)}
    >
      {/* Main arrow head: flattened to lie in the XZ plane, pointing +X */}
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.25, 0, 0]}>
        <coneGeometry args={[0.22, 0.44, 6]} />
        <meshPhysicalMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={1.0}
          metalness={0.4}
          roughness={0.3}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Arrow shaft lying on plane */}
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
        <meshPhysicalMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glowing trail particles (drawn behind along -X) */}
      <points ref={trailRef} position={[0, 0.02, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailParticles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-opacity"
            args={[trailParticles.opacities, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ff6b6b"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
    </animated.group>
  );
}
