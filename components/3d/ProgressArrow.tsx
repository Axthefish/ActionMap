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
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const trailRef = useRef<THREE.Points>(null);
  const energyRingsRef = useRef<THREE.Group>(null);
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
  
  // Subtle floating animation (top-down, keep low height)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (groupRef.current) {
      const floatY = Math.sin(time * 1.5) * 0.02;
      groupRef.current.position.y = 0.2 + floatY;
      
      // Subtle rotation wobble
      groupRef.current.rotation.z = Math.sin(time * 2) * 0.05;
    }
    
    // Remove spotlight pulsing for top-down map clarity
    
    // Trail animation
    if (trailRef.current) {
      const geometry = trailRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] = Math.sin(time * 3 + i * 0.2) * 0.02;
      }
      geometry.attributes.position.needsUpdate = true;
    }
    
    // Energy rings rotation
    if (energyRingsRef.current) {
      energyRingsRef.current.rotation.z = time * 2;
    }
  });
  
  return (
    <animated.group
      ref={groupRef}
      position-x={animatedPosition.to((p) => -pathLength / 2 + p * pathLength)}
    >
      {/* Flat-ish arrow for top-down view (axis along +Z) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshPhysicalMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={1.0}
          metalness={0.4}
          roughness={0.3}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Arrow shaft */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshPhysicalMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glowing trail particles */}
      <points ref={trailRef} position={[0, 0.3, 0]}>
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
          size={0.08}
          color="#ff6b6b"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Energy rings field */}
      <group ref={energyRingsRef}>
        {[0.5, 0.7, 0.9].map((radius, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.03, 32]} />
            <meshBasicMaterial
              color="#ff6b6b"
              transparent
              opacity={0.3 - i * 0.08}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#ff6b6b"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* No spotlight in top-down mode */}
    </animated.group>
  );
}
