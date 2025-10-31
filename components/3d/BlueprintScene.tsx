'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import MainPath from './MainPath';
import StageAreas from './StageAreas';
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
      camera={{
        position: [0, 1.2, 2.5],
        fov: 50,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* Enhanced lighting system */}
      <ambientLight intensity={0.5} />
      
      {/* Remove harsh directional light, add subtle fill */}
      <directionalLight position={[5, 10, 5]} intensity={0.2} color="#ffffff" />
      
      {/* Point lights for depth and atmosphere */}
      <pointLight position={[-8, 5, -5]} intensity={0.4} color="#4a9eff" distance={20} />
      <pointLight position={[8, 5, -5]} intensity={0.3} color="#87ceeb" distance={20} />
      <pointLight position={[0, -5, 5]} intensity={0.2} color="#1e3a8a" distance={15} />
      
      {/* Three-layer starfield */}
      <SceneStars />
      
      {/* Sync camera to arrow first-person position */}
      <FirstPersonCamera 
        arrowPosition={currentPosition} 
        hasBlueprint={!!blueprintDefinition}
        setOrbitTarget={(x:number,y:number,z:number)=>{
          if (controlsRef.current) {
            controlsRef.current.target.set(x,y,z);
            controlsRef.current.update();
          }
        }}
      />

      {/* Blueprint elements */}
      <Suspense fallback={null}>
        {blueprintDefinition && (
          <>
            {/* Stage regions rendered behind the path to reduce clutter */}
            <StageAreas blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <MainPath blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <ProgressArrow position={currentPosition} />
            {actionLines.length > 0 && (
              <ActionLines actionLines={actionLines} arrowPosition={currentPosition} />
            )}
          </>
        )}
      </Suspense>
      
      {/* Camera controls with optimized settings */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.1}
        enableDamping={true}
        dampingFactor={0.05}
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

// Camera that snaps to arrow (first-person) whenever position changes
function FirstPersonCamera({ arrowPosition, hasBlueprint, setOrbitTarget }: { arrowPosition: number; hasBlueprint: boolean; setOrbitTarget: (x:number,y:number,z:number)=>void }) {
  const { camera } = useThree();
  const initialSetRef = useRef(false);
  useEffect(() => {
    if (initialSetRef.current) return;
    if (!hasBlueprint) return;
    const pathLength = 10;
    const x = -pathLength / 2 + arrowPosition * pathLength;
    camera.position.set(x, 1.2, 2.5);
    camera.lookAt(x + 1, 0.6, 0);
    setOrbitTarget(x + 1, 0.6, 0);
    initialSetRef.current = true; // only set on first render
  }, [arrowPosition, hasBlueprint, camera]);
  return null;
}

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
