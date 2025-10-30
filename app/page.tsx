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
    <main className="h-screen w-screen overflow-hidden bg-black text-white">
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
        <div className="col-span-3 border-r border-gray-800">
          <NarrativePanel />
        </div>
        
        {/* Center - 3D Canvas */}
        <div className="col-span-6 relative">
          <BlueprintScene />
        </div>
        
        {/* Right Panel - Action HUD */}
        <div className="col-span-3 border-l border-gray-800">
          <ActionHUD />
        </div>
      </div>
      
      {/* Info Card Overlay */}
      <InfoCard />
      
      {/* Title Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          Dynamic Strategic Blueprint
        </h1>
      </div>
    </main>
  );
}
