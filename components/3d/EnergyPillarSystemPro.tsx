"use client";

import React, { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { useBlueprintStore } from "@/lib/store/blueprintStore";
import { mapTo3DData, ActionSphere } from "@/lib/3d-mapper";

function Pillar({ height = 4, color = "#60a5fa" }: { height?: number; color?: string }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]}> 
        <cylinderGeometry args={[0.3, 0.3, height, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          transmission={0.9}
          thickness={0.5}
          roughness={0.2}
          opacity={0.6}
          transparent
        />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function ActionSpheres({ actions }: { actions: ActionSphere[] }) {
  return (
    <group>
      {actions.map((action, i) => {
        const y = 0.6 + i * 0.6;
        const color =
          action.status === "strength"
            ? 0x10b981
            : action.status === "opportunity"
            ? 0xf97316
            : 0xffffff;
        return (
          <mesh key={action.id} position={[0, y, 0]}> 
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function EnergyPillarSystemPro() {
  const blueprintDefinition = useBlueprintStore((s) => s.blueprintDefinition);
  const actionLines = useBlueprintStore((s) => s.actionLines);

  const data = useMemo(() => mapTo3DData(blueprintDefinition, actionLines), [blueprintDefinition, actionLines]);

  const cameraDistance = useMemo(() => {
    const count = Math.max(1, data.modules.length);
    return 12 + Math.max(0, count - 3) * 2;
  }, [data.modules.length]);

  const [dpr, setDpr] = useState<[number, number]>([1, 2]);

  return (
    <Canvas
      camera={{ position: [0, 6, cameraDistance], fov: 45 }}
      style={{ background: "transparent" }}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr([1, 2])}
        onDecline={() => setDpr([1, 1.5] as [number, number])}
      />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />

      <Suspense fallback={null}>
        <group position={[(-Math.max(1, data.modules.length - 1) * 2), 0, 0]}>
          {data.modules.map((m, idx) => (
            <group key={m.id} position={[idx * 4, 0, 0]}>
              <Pillar height={4 + Math.min(6, m.actions.length * 0.6)} color={m.color} />
              <ActionSpheres actions={m.actions} />
            </group>
          ))}
        </group>
      </Suspense>

      <OrbitControls enablePan enableRotate enableZoom maxPolarAngle={Math.PI / 2} />
    </Canvas>
  );
}

