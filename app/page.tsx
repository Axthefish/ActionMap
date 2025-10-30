"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import InitWizard from "@/components/ui/InitWizard";
import CalibrationDialog from "@/components/ui/CalibrationDialog";
import NarrativePanel from "@/components/ui/NarrativePanel";
import ActionHUD from "@/components/ui/ActionHUD";
import InfoCard from "@/components/ui/InfoCard";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { applyDemoSeed, isDemo } from "@/lib/demo";

// Dynamically import 3D scene to avoid SSR issues
const BlueprintScene = dynamic(() => import("@/components/3d/BlueprintScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-foreground/70">Loading 3D Scene...</div>
    </div>
  ),
});

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  
  const handleInitComplete = () => {
    setIsInitialized(true);
    setShowCalibration(true);
  };
  
  useEffect(() => {
    if (isDemo()) {
      applyDemoSeed();
      setIsInitialized(true);
      setShowCalibration(false);
    }
  }, []);
  
  return (
    <div className="h-screen overflow-hidden">
      {!isInitialized && <InitWizard onInitComplete={handleInitComplete} />}
      <CalibrationDialog isOpen={showCalibration} onClose={() => setShowCalibration(false)} />

      <div className="grid h-full grid-cols-12 gap-4 p-4">
        <div className="col-span-3">
          <Card className="h-full p-4">
            <NarrativePanel />
          </Card>
        </div>

        <div className="relative col-span-6">
          <BlueprintScene />
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 select-none">
            <h1 className="text-center text-2xl font-bold">Dynamic Strategic Blueprint</h1>
          </div>
        </div>

        <div className="col-span-3">
          <Card className="h-full p-4">
            <ActionHUD />
          </Card>
        </div>
      </div>

      <InfoCard />
    </div>
  );
}
