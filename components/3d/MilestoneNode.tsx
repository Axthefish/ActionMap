'use client';

import { useState, useRef, useMemo } from 'react';
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
  const [clicked, setClicked] = useState(false);
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const setInfoCardData = useBlueprintStore((state) => state.setInfoCardData);
  
  // Particle system for hover effect
  const particleCount = 20;
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;
    }
    return positions;
  }, []);
  
  // Animations
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Sphere scale animation
    if (sphereRef.current) {
      const targetScale = hovered ? 1.3 : 1;
      sphereRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Subtle float
      sphereRef.current.position.y = Math.sin(time * 1.5) * 0.05;
    }
    
    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.5;
    }
    
    // Outer ring expansion on hover
    if (outerRingRef.current) {
      const targetScale = hovered ? 1.5 : 1.0;
      outerRingRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      outerRingRef.current.rotation.z = -time * 0.3;
    }
    
    // Particle orbit on hover
    if (particlesRef.current && hovered) {
      particlesRef.current.rotation.z = time * 2;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.8;
    } else if (particlesRef.current) {
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 0;
    }
    
    // Click burst animation
    if (clicked && particlesRef.current) {
      const burstScale = 1 + Math.sin(time * 10) * 0.3;
      particlesRef.current.scale.setScalar(burstScale);
    }
  });
  
  const handleClick = () => {
    setInfoCardData({
      label: node.label,
      content: node.content,
      position,
    });
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };
  
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  
  // Determine if this is a key milestone (use accent color)
  const isKeyMilestone = node.label.toLowerCase().includes('milestone') || 
                          node.label.toLowerCase().includes('goal');
  
  const baseColor = isKeyMilestone ? '#f59e0b' : '#3b82f6'; // Gold or Blue
  const emissiveColor = isKeyMilestone ? '#f59e0b' : '#00d4ff';
  
  return (
    <group position={position}>
      {/* Main sphere with physical material */}
      <mesh
        ref={sphereRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshPhysicalMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 1.0 : 0.5}
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </mesh>
      
      {/* Inner rotating ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial
          color={emissiveColor}
          transparent
          opacity={hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer expanding ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.43, 32]} />
        <meshBasicMaterial
          color={emissiveColor}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={emissiveColor}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Ambient glow sphere */}
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={emissiveColor}
          transparent
          opacity={hovered ? 0.15 : 0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

