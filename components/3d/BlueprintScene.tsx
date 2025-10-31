'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
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
      orthographic
      camera={{
        position: [0, 20, 0],
        zoom: 80,
        near: 0.1,
        far: 1000,
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
      
      {/* No 3D stars; rely on global 2D starfield */}
      
      {/* Top-down camera init */}
      <TopDownCamera arrowPosition={currentPosition} hasBlueprint={!!blueprintDefinition} controlsRef={controlsRef} />

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
      
      {/* Map-like top-down controls: pan + zoom */}
      <MapControls
        ref={controlsRef}
        enableRotate={false}
        zoomSpeed={1.0}
        panSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

// Initialize orthographic, top-down camera and center the target
function TopDownCamera({ arrowPosition, hasBlueprint, controlsRef }: { arrowPosition: number; hasBlueprint: boolean; controlsRef: React.MutableRefObject<any> }) {
  const { camera } = useThree();
  const initialSetRef = useRef(false);
  useEffect(() => {
    if (initialSetRef.current) return;
    if (!hasBlueprint) return;
    const pathLength = 10;
    const x = -pathLength / 2 + arrowPosition * pathLength;
    (camera as any).position.set(x, 20, 0);
    (camera as any).up.set(0, 0, 1);
    (camera as any).lookAt(x, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(x, 0, 0);
      controlsRef.current.update();
    }
    initialSetRef.current = true;
  }, [arrowPosition, hasBlueprint, camera]);
  return null;
}

// No star layer components. We rely on 2D starry background canvas.
