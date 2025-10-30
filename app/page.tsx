"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { applyDemoSeed, isDemo } from "@/lib/demo";
import { useBlueprintStore } from "@/lib/store/blueprintStore";

// Dynamically import 3D scene to avoid SSR issues
const BlueprintScene = dynamic(() => import("@/components/3d/BlueprintScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-foreground/70">Loading 3D Scene...</div>
    </div>
  ),
});

// Import UI components
const WelcomePage = dynamic(() => import("@/components/ui/WelcomePage"), { ssr: false });
const GoalInputPage = dynamic(() => import("@/components/ui/GoalInputPage"), { ssr: false });
const MainDashboard = dynamic(() => import("@/components/ui/MainDashboard"), { ssr: false });

type AppStage = 'welcome' | 'input' | 'dashboard';

export default function Home() {
  const [stage, setStage] = useState<AppStage>('welcome');
  const blueprintDefinition = useBlueprintStore(state => state.blueprintDefinition);
  
  useEffect(() => {
    if (isDemo()) {
      applyDemoSeed();
      setStage('dashboard');
    }
  }, []);
  
  // Auto-progress to dashboard when blueprint is ready
  useEffect(() => {
    if (blueprintDefinition && stage === 'input') {
      // Small delay to show success state
      setTimeout(() => setStage('dashboard'), 800);
    }
  }, [blueprintDefinition, stage]);
  
  if (stage === 'welcome') {
    return <WelcomePage onStartNewGoal={() => setStage('input')} />;
  }
  
  if (stage === 'input') {
    return <GoalInputPage />;
  }
  
  return <MainDashboard />;
}
