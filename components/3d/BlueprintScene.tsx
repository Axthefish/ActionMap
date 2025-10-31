'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import MainPath from './MainPath';
import StageAreas from './StageAreas';
import StageSideContent from './StageSideContent';
import ProgressArrow from './ProgressArrow';
import ActionLines from './ActionLines';
import { useBlueprintStore } from '@/lib/store/blueprintStore';
import { detectPerformanceTier, getPerformanceConfig } from '@/lib/performance';
import * as THREE from 'three';

export default function BlueprintScene() {
  const blueprintDefinition = useBlueprintStore((state) => state.blueprintDefinition);
  const currentPosition = useBlueprintStore((state) => state.currentPosition);
  const actionLines = useBlueprintStore((state) => state.actionLines);
  const controlsRef = useRef<any>(null);
  return (
    <Canvas
      camera={undefined}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* Top-down orthographic camera for true map-like view */}
      <OrthographicCamera makeDefault position={[0, 12, 0]} zoom={70} near={0.1} far={100} />
      
      {/* Soft ambient since we view from above */}
      <ambientLight intensity={0.6} />
      
      {/* Three-layer starfield */}
      <SceneStars />
      
      {/* No first-person snapping in top-down mode */}

      {/* Blueprint elements */}
      <Suspense fallback={null}>
        {blueprintDefinition && (
          <>
            {/* Stage regions rendered behind the path to reduce clutter */}
            <StageAreas blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <StageSideContent blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <MainPath blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <ProgressArrow position={currentPosition} />
            {actionLines.length > 0 && (
              <ActionLines actionLines={actionLines} arrowPosition={currentPosition} />
            )}
          </>
        )}
      </Suspense>
      
      {/* Map-style controls: pan + zoom only, rotation disabled to preserve orthographic top-down */}
      <MapControls
        ref={controlsRef}
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={30}
        maxZoom={140}
        zoomSpeed={1.0}
        panSpeed={0.6}
      />
    </Canvas>
  );
}

// Enhanced three-layer starfield component
function SceneStars() {
  const [config, setConfig] = useState(() => {
    if (typeof window === 'undefined') return null;
    const tier = detectPerformanceTier();
    return getPerformanceConfig(tier);
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tier = detectPerformanceTier();
      setConfig(getPerformanceConfig(tier));
    }
  }, []);
  
  if (!config) return null;
  
  // Adjust star count for 3D scene (less than canvas background)
  const sceneStarCount = Math.floor(config.starCount * 0.3);
  
  return (
    <>
      <StarLayer count={Math.floor(sceneStarCount * 0.5)} distance={30} size={0.04} layer={1} speed={0} enableRotation={false} />
      <StarLayer count={Math.floor(sceneStarCount * 0.3)} distance={20} size={0.06} layer={2} speed={0} enableRotation={false} />
      <StarLayer count={Math.floor(sceneStarCount * 0.2)} distance={15} size={0.08} layer={3} speed={0} enableRotation={false} />
    </>
  );
}

// (Removed FirstPersonCamera in top-down mode)

interface StarLayerProps {
  count: number;
  distance: number;
  size: number;
  layer: number;
  speed: number;
  enableRotation: boolean;
}

function StarLayer({ count, distance, size, layer, speed, enableRotation }: StarLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create circular star texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position in spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = distance + (Math.random() - 0.5) * 5;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Slight color variation (white to light blue)
      const colorVariation = Math.random() * 0.2;
      colors[i3] = 1;
      colors[i3 + 1] = 1 - colorVariation;
      colors[i3 + 2] = 1;
    }
    
    return { positions, colors };
  }, [count, distance]);
  
  useFrame(({ clock }) => {
    if (pointsRef.current && enableRotation) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.01 * speed * layer * 0.3;
      pointsRef.current.rotation.x = clock.getElapsedTime() * 0.005 * speed * layer * 0.2;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        map={texture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
