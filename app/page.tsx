"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CalibrationDialog from "@/components/ui/CalibrationDialog";
import NarrativePanel from "@/components/ui/NarrativePanel";
import ActionHUD from "@/components/ui/ActionHUD";
import InfoCard from "@/components/ui/InfoCard";
import { Card } from "@/components/ui/card";

// Dynamically import 3D scene to avoid SSR issues
const BlueprintScene = dynamic(() => import("@/components/3d/BlueprintScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-foreground/70">Loading 3D Scene...</div>
    </div>
  ),
});

// Import UI components for multi-stage flow
const WelcomePage = dynamic(() => import("@/components/ui/WelcomePage"), { ssr: false });
const GoalInputPage = dynamic(() => import("@/components/ui/GoalInputPage"), { ssr: false });

type AppStage = 'welcome' | 'input' | 'dashboard';

export default function Home() {
  const [stage, setStage] = useState<AppStage>('welcome');
  const [showCalibration, setShowCalibration] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  const handleInitComplete = () => {
    setShowCalibration(true);
  };
  const startDashboardWithAnimation = () => {
    setStage('dashboard');
    setAnimateIn(true);
    setTimeout(() => setAnimateIn(false), 800);
  };
  
  // Show welcome page
  if (stage === 'welcome') {
    return <WelcomePage onStartNewGoal={() => setStage('input')} />;
  }
  
  // Show goal input page
  if (stage === 'input') {
    return <GoalInputPage onComplete={startDashboardWithAnimation} />;
  }
  
  // Main dashboard - original three-column layout
  return (
    <div className="h-screen overflow-hidden">
      <CalibrationDialog isOpen={showCalibration} onClose={() => setShowCalibration(false)} />

      <div className="grid h-full grid-cols-12 gap-4 p-4">
        <div className="col-span-3">
          <Card className={`h-full p-4 overflow-y-auto ${animateIn ? 'animate-in fade-in slide-in-from-left-8 duration-700' : ''}`}>
            <NarrativePanel />
          </Card>
        </div>

        <div className={`relative col-span-6 ${animateIn ? 'animate-in fade-in duration-700 delay-150' : ''}`}>
          <BlueprintScene />
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 select-none">
            <h1 className="text-center text-2xl font-bold">Dynamic Strategic Blueprint</h1>
          </div>
        </div>

            <div className="col-span-3">
              <Card className="h-full p-4 overflow-y-auto">
                <ActionHUD />
              </Card>
            </div>
      </div>

      <InfoCard />
    </div>
  );
}
