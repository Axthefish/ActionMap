'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const lineRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const endMarkerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const setSelectedActionLineId = useBlueprintStore((state) => state.setSelectedActionLineId);
  const selectedId = useBlueprintStore((state) => state.selectedActionLineId);
  
  const isSelected = selectedId === line.line_id;
  
  // Grow animation on mount with easing
  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      progress = 1 - Math.pow(1 - progress, 3);
      setGrowProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    setTimeout(() => {
      animate();
    }, index * 150);
  }, [index]);
  
  // Calculate branch direction with slight curve
  const angle = (index - (totalCount - 1) / 2) * (Math.PI / 6);
  const length = 2.2;
  
  // Create curved line with hand-drawn jitter
  const lineCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const currentLength = length * t;
      
      // Add slight jitter for hand-drawn feel
      const jitterX = (Math.random() - 0.5) * 0.02;
      const jitterY = (Math.random() - 0.5) * 0.02;
      
      const x = Math.sin(angle) * currentLength + jitterX;
      const y = Math.cos(angle) * currentLength + jitterY;
      
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    return new THREE.CatmullRomCurve3(points);
  }, [angle, length]);
  
  // Flow particles along line
  const flowParticles = useMemo(() => {
    const count = 15;
    const positions = new Float32Array(count * 3);
    return { count, positions };
  }, []);
  
  // Animations
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Update line to show grow progress
    if (lineRef.current && lineCurve) {
      const geometry = lineRef.current.geometry as THREE.TubeGeometry;
      const visibleLength = growProgress;
      // Scale could be animated but tube geometry doesn't support dynamic trimming well
      // Alternative: Use shader or multiple segments
    }
    
    // Particle flow animation
    if (particlesRef.current && (hovered || isSelected) && growProgress > 0.9) {
      const geometry = particlesRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < flowParticles.count; i++) {
        const t = ((time * 0.3 + i / flowParticles.count) % 1);
        const point = lineCurve.getPoint(t);
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }
      geometry.attributes.position.needsUpdate = true;
      
      (particlesRef.current.material as THREE.PointsMaterial).opacity = hovered ? 0.8 : 0.5;
    } else if (particlesRef.current) {
      (particlesRef.current.material as THREE.PointsMaterial).opacity = 0;
    }
    
    // End marker pulsing
    if (endMarkerRef.current && growProgress > 0.8) {
      let pulseSpeed = 2;
      let pulseAmount = 0.15;
      
      if (line.style === 'urgent') {
        pulseSpeed = 4;
        pulseAmount = 0.25;
      } else if (line.style === 'experimental') {
        pulseSpeed = 3;
        pulseAmount = 0.2;
      }
      
      const pulse = Math.sin(time * pulseSpeed) * pulseAmount + 1;
      endMarkerRef.current.scale.setScalar(pulse);
    }
    
    // Glow intensity for selected/hovered
    if (glowRef.current) {
      const targetOpacity = isSelected ? 0.4 : (hovered ? 0.3 : 0.1);
      const current = (glowRef.current.material as THREE.MeshBasicMaterial).opacity;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 
        THREE.MathUtils.lerp(current, targetOpacity, 0.1);
    }
  });
  
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
  
  // Color based on style (using design system colors)
  const getColor = () => {
    if (isSelected) return '#10b981'; // success green
    if (hovered) return '#00d4ff'; // primary bright blue
    
    switch (line.style) {
      case 'urgent':
        return '#ff6b6b'; // destructive red
      case 'experimental':
        return '#f59e0b'; // accent gold
      case 'suggestion':
      default:
        return '#3b82f6'; // primary blue
    }
  };
  
  const color = getColor();
  const endPoint = lineCurve.getPoint(1);
  
  return (
    <group>
      {/* Main line as tube */}
      {growProgress > 0 && (
        <mesh
          ref={lineRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <tubeGeometry args={[lineCurve, 20, 0.03, 8, false]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.0 : (hovered ? 0.8 : 0.5)}
            transparent
            opacity={growProgress}
          />
        </mesh>
      )}
      
      {/* Outer glow tube */}
      {growProgress > 0.5 && (
        <mesh
          ref={glowRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <tubeGeometry args={[lineCurve, 20, 0.06, 8, false]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Flow particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[flowParticles.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={color}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* End point marker */}
      {growProgress > 0.8 && (
        <mesh
          ref={endMarkerRef}
          position={[endPoint.x, endPoint.y, endPoint.z]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.0}
          />
        </mesh>
      )}
      
      {/* End point glow */}
      {growProgress > 0.8 && (
        <mesh position={[endPoint.x, endPoint.y, endPoint.z]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.3 : 0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}
