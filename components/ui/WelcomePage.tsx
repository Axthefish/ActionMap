"use client";

import React from "react";

interface WelcomePageProps {
  onStartNewGoal: () => void;
}

export default function WelcomePage({ onStartNewGoal }: WelcomePageProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-3">
          {/* Blueprint Icon - SVG design representing strategic planning */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="4" stroke="url(#gradient1)" strokeWidth="2" fill="none"/>
            <circle cx="8" cy="16" r="2" fill="url(#gradient1)"/>
            <circle cx="16" cy="12" r="2" fill="url(#gradient1)"/>
            <circle cx="24" cy="16" r="2" fill="url(#gradient1)"/>
            <line x1="10" y1="16" x2="14" y2="13" stroke="url(#gradient1)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="18" y1="13" x2="22" y2="16" stroke="url(#gradient1)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 14 L16 20 L20 24" stroke="url(#gradient1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <defs>
              <linearGradient id="gradient1" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00d4ff"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-2xl font-bold text-foreground">Dynamic Blueprint</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="grid grid-cols-2 gap-12 max-w-7xl w-full">
          {/* Left Column - Options */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-foreground mb-3">
                Welcome back, User
              </h1>
              <p className="text-xl text-foreground/60">
                Ready to shape your future?
              </p>
            </div>

            {/* Option Cards */}
            <button
              onClick={onStartNewGoal}
              className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-primary/30"
            >
              <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition">
                Start a New Goal
              </h3>
              <p className="text-foreground/60 text-base">
                Define your next ambition and create a clear path forward.
              </p>
            </button>

            <button className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-accent/30 opacity-60 cursor-not-allowed">
              <h3 className="text-2xl font-semibold text-foreground/60 mb-3">
                Resume Session
              </h3>
              <p className="text-foreground/40 text-base">
                Continue defining your current project.
              </p>
            </button>

            <button className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-success/30 opacity-60 cursor-not-allowed">
              <h3 className="text-2xl font-semibold text-foreground/60 mb-3">
                Review Past Sessions
              </h3>
              <p className="text-foreground/40 text-base">
                Reflect on your journey and insights.
              </p>
            </button>
          </div>

          {/* Right Column - Visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-xl glass-strong rounded-3xl p-12 border border-white/10 overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-success/20 opacity-50" />
              
              {/* 3D Shape Placeholder */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-64 h-64 rounded-[4rem] bg-gradient-to-br from-primary to-accent opacity-80 transform rotate-45 shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <footer className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <p className="text-foreground/50 text-sm italic">
          "The secret of getting ahead is getting started." - Mark Twain
        </p>
      </footer>
    </div>
  );
}

