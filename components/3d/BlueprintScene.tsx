'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import MainPath from './MainPath';
import ProgressArrow from './ProgressArrow';
import ActionLines from './ActionLines';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

export default function BlueprintScene() {
  const blueprintDefinition = useBlueprintStore((state) => state.blueprintDefinition);
  const currentPosition = useBlueprintStore((state) => state.currentPosition);
  const actionLines = useBlueprintStore((state) => state.actionLines);
  
  return (
    <Canvas
      camera={{
        position: [0, 5, 10],
        fov: 60,
      }}
      style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a)' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a9eff" />
      
      {/* Particle background for deep space effect */}
      <Stars />
      
      {/* Blueprint elements */}
      <Suspense fallback={null}>
        {blueprintDefinition && (
          <>
            <MainPath blueprintDefinition={blueprintDefinition} currentPosition={currentPosition} />
            <ProgressArrow position={currentPosition} />
            {actionLines.length > 0 && (
              <ActionLines actionLines={actionLines} arrowPosition={currentPosition} />
            )}
          </>
        )}
      </Suspense>
      
      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

// Simple particle stars component
function Stars() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 50;
    positions[i + 1] = (Math.random() - 0.5) * 50;
    positions[i + 2] = (Math.random() - 0.5) * 50;
  }
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        opacity={0.6}
        transparent
        sizeAttenuation
      />
    </points>
  );
}

