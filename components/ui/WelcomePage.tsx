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
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
          <span className="text-2xl font-bold text-foreground">Dynamic Blueprint</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-foreground transition">
            <span className="text-lg">⚙️</span>
          </button>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-foreground transition">
            <span className="text-lg">❓</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-foreground font-semibold">
            U
          </div>
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

