'use client';

import { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { BlueprintDefinition, MilestoneNode } from '@/lib/types';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

interface StageBranchesProps {
  blueprintDefinition: BlueprintDefinition;
}

export default function StageBranches({ blueprintDefinition }: StageBranchesProps) {
  const { main_path, milestone_nodes } = blueprintDefinition;
  const setInfoCardData = useBlueprintStore((s) => s.setInfoCardData);
  const pathLength = 10;
  const segmentLength = pathLength / Math.max(1, main_path.length);

  const contentByStage = useMemo(() => {
    const m = new Map<string, MilestoneNode['content']>();
    milestone_nodes.forEach((n) => m.set(n.label, n.content));
    return m;
  }, [milestone_nodes]);

  return (
    <group>
      {main_path.map((seg, segIdx) => {
        const startX = -pathLength / 2 + segIdx * segmentLength;
        const signals = contentByStage.get(seg.stage_name)?.key_signals ?? [];
        const maxSignals = Math.min(4, signals.length);
        const side = segIdx % 2 === 0 ? 1 : -1; // alternate sides by stage to reduce overlap
        const branchLength = 1.1 + (segIdx % 3) * 0.15; // small variation for visual rhythm
        const y = 0.35; // slightly above ground plate
        const color = segIdx % 3 === 0 ? '#93c5fd' : segIdx % 3 === 1 ? '#60a5fa' : '#38bdf8';

        return (
          <group key={`branches-${seg.segment_id}`}>
            {Array.from({ length: maxSignals }).map((_, i) => {
              const t = (i + 1) / (maxSignals + 1);
              const x = startX + t * segmentLength;
              const zEnd = side * branchLength * (1 - 0.08 * i); // slight stagger
              const spherePos: [number, number, number] = [x, y, zEnd];
              const label = signals[i];
              return (
                <Branch
                  key={`branch-${seg.segment_id}-${i}`}
                  x={x}
                  y={y}
                  zEnd={zEnd}
                  color={color}
                  label={label}
                  onClick={() => {
                    const content = contentByStage.get(seg.stage_name);
                    if (!content) return;
                    // Show InfoCard with stage label + specific key signal emphasized in title
                    setInfoCardData({
                      label: `${seg.stage_name} · 重点: ${label}`,
                      content,
                      position: spherePos,
                    });
                  }}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function Branch({ x, y, zEnd, color, label, onClick }: { x: number; y: number; zEnd: number; color: string; label: string; onClick: () => void; }) {
  const [hovered, setHovered] = useState(false);
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const length = Math.abs(zEnd);
  const zCenter = zEnd / 2;

  return (
    <group>
      {/* branch rod */}
      <mesh position={[x, y, zCenter]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, length, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} transparent opacity={0.9} />
      </mesh>

      {/* clickable node at the end */}
      <mesh
        ref={sphereRef}
        position={[x, y, zEnd]}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.9 : 0.6} metalness={0.3} roughness={0.2} clearcoat={0.2} />
      </mesh>

      {/* glow ring billboard */}
      <mesh ref={ringRef} position={[x, y, zEnd]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.13, 0.17, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.6 : 0.3} />
      </mesh>

      {/* small html label near the node */}
      <Html position={[x, y + 0.18, zEnd]} sprite distanceFactor={12} zIndexRange={[10, 0]}>
        <div className="rounded bg-slate-900/70 backdrop-blur px-2 py-[2px] text-[11px] border border-white/10 text-slate-100 whitespace-nowrap shadow">
          {label}
        </div>
      </Html>
    </group>
  );
}


