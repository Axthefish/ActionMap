'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import InitWizard from '@/components/ui/InitWizard';
import CalibrationDialog from '@/components/ui/CalibrationDialog';
import NarrativePanel from '@/components/ui/NarrativePanel';
import ActionHUD from '@/components/ui/ActionHUD';
import InfoCard from '@/components/ui/InfoCard';

// Dynamically import 3D scene to avoid SSR issues
const BlueprintScene = dynamic(() => import('@/components/3d/BlueprintScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-white">Loading 3D Scene...</div>
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
  
  return (
    <main className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Init Wizard Modal */}
      {!isInitialized && (
        <InitWizard onInitComplete={handleInitComplete} />
      )}
      
      {/* Calibration Dialog */}
      <CalibrationDialog 
        isOpen={showCalibration} 
        onClose={() => setShowCalibration(false)} 
      />
      
      {/* Main Layout */}
      <div className="grid grid-cols-12 h-full">
        {/* Left Panel - Narrative */}
        <div className="col-span-3">
          <NarrativePanel />
        </div>
        
        {/* Center - 3D Canvas */}
        <div className="col-span-6 relative">
          <BlueprintScene />
        </div>
        
        {/* Right Panel - Action HUD */}
        <div className="col-span-3">
          <ActionHUD />
        </div>
      </div>
      
      {/* Info Card Overlay */}
      <InfoCard />
      
      {/* Title Overlay with glass morphism */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 glass px-6 py-3 rounded-xl shadow-lg">
        <h1 className="text-apple-h2 font-bold text-foreground tracking-tight">
          Dynamic Strategic Blueprint
        </h1>
      </div>
    </main>
  );
}
