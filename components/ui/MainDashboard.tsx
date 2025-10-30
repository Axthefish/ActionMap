"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useBlueprintStore } from "@/lib/store/blueprintStore";
import CalibrationDialog from "./CalibrationDialog";
import NarrativePanel from "./NarrativePanel";
import ActionHUD from "./ActionHUD";
import InfoCard from "./InfoCard";

const BlueprintScene = dynamic(() => import("@/components/3d/BlueprintScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-foreground/70">Loading 3D Scene...</div>
    </div>
  ),
});

export default function MainDashboard() {
  const [showCalibration, setShowCalibration] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'settings'>('dashboard');
  
  const blueprintDefinition = useBlueprintStore(state => state.blueprintDefinition);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#1f2937] to-[#111827]">
      <CalibrationDialog isOpen={showCalibration} onClose={() => setShowCalibration(false)} />
      
      {/* Sidebar */}
      <aside className="absolute left-0 top-0 h-full w-52 glass-strong border-r border-white/10 flex flex-col p-4 z-20">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-foreground font-semibold text-lg">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">User</div>
            <div className="text-xs text-foreground/50 truncate">Growth Journey</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'goals'
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <span className="text-xl">🎯</span>
            <span className="font-medium">Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-primary/20 text-primary'
                : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="font-medium">Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="absolute left-52 top-0 right-0 bottom-0 flex">
        {/* 3D Visualization Area */}
        <div className="flex-1 relative p-6">
          <div className="h-full glass-strong rounded-2xl overflow-hidden border border-white/10 relative">
            <BlueprintScene />
            
            {/* Breadcrumb */}
            <div className="absolute top-6 right-6 glass px-4 py-2 rounded-lg text-sm text-foreground/70">
              <span className="text-foreground/50">Universal Framework</span>
              <span className="mx-2">/</span>
              <span className="text-foreground/50">Core Module</span>
              <span className="mx-2">/</span>
              <span className="text-foreground">Current Stage</span>
            </div>

            {/* Placeholder text */}
            {!blueprintDefinition && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-4xl text-foreground/30 font-light">
                    Interactive 3D Blueprint Viewer
                  </div>
                  <div className="text-foreground/20">(Initializing...)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="w-96 p-6 pl-0">
          <div className="h-full glass-strong rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-foreground mb-2">Strategy</h2>
              <p className="text-sm text-foreground/60 leading-relaxed">
                The Strategy module is about defining a clear path to your goals. It involves
                breaking down your vision into manageable steps, identifying resources, and
                anticipating challenges.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
              <button className="px-4 py-3 text-sm font-medium text-primary border-b-2 border-primary">
                Actions
              </button>
              <button className="px-4 py-3 text-sm font-medium text-foreground/50 hover:text-foreground transition">
                Narrative
              </button>
              <button className="px-4 py-3 text-sm font-medium text-foreground/50 hover:text-foreground transition">
                Progress
              </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <ActionHUD />
            </div>
          </div>
        </div>
      </main>

      <InfoCard />
    </div>
  );
}

