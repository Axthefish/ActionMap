"use client";

import React, { useState } from "react";
import { useLanguageStore } from '@/lib/store/languageStore';
import { t } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';
import ResumeSessionDialog from './ResumeSessionDialog';
import ReviewSessionsDialog from './ReviewSessionsDialog';

interface WelcomePageProps {
  onStartNewGoal: () => void;
  onResume: () => void;
}

export default function WelcomePage({ onStartNewGoal, onResume }: WelcomePageProps) {
  const lang = useLanguageStore((s) => s.language);
  const [showResume, setShowResume] = useState(false);
  const [showReview, setShowReview] = useState(false);
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
          <span className="text-2xl font-bold text-foreground">{t(lang, 'app_title')}</span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="grid grid-cols-2 gap-12 max-w-7xl w-full">
          {/* Left Column - Options */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-foreground mb-3">{t(lang, 'welcome_title')}</h1>
              <p className="text-xl text-foreground/60">{t(lang, 'welcome_sub')}</p>
            </div>

            {/* Option Cards */}
            <button
              onClick={onStartNewGoal}
              className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-primary/30"
            >
              <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition">{t(lang, 'start_goal')}</h3>
              <p className="text-foreground/60 text-base">{t(lang, 'start_goal_desc')}</p>
            </button>

            <button onClick={() => setShowResume(true)} className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-accent/30">
              <h3 className="text-2xl font-semibold text-foreground mb-3">{t(lang, 'resume_session')}</h3>
              <p className="text-foreground/60 text-base">{t(lang, 'resume_session_desc')}</p>
            </button>

            <button onClick={() => setShowReview(true)} className="group glass-strong rounded-2xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-white/10 hover:border-success/30">
              <h3 className="text-2xl font-semibold text-foreground mb-3">{t(lang, 'review_sessions')}</h3>
              <p className="text-foreground/60 text-base">{t(lang, 'review_sessions_desc')}</p>
            </button>
          </div>

          {/* Right Column - Visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-xl glass-strong rounded-3xl p-12 border border-white/10 overflow-hidden">
              {/* Abstract network visualization */}
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connection lines */}
                <path d="M100 100 L200 150 L300 100" stroke="url(#lineGrad1)" strokeWidth="2" opacity="0.4" />
                <path d="M200 150 L200 250" stroke="url(#lineGrad1)" strokeWidth="2" opacity="0.4" />
                <path d="M100 100 L100 250" stroke="url(#lineGrad2)" strokeWidth="2" opacity="0.3" />
                <path d="M300 100 L300 250" stroke="url(#lineGrad2)" strokeWidth="2" opacity="0.3" />
                <path d="M100 250 L200 300 L300 250" stroke="url(#lineGrad1)" strokeWidth="2" opacity="0.4" />
                
                {/* Nodes */}
                <circle cx="100" cy="100" r="8" fill="url(#nodeGrad1)" opacity="0.9" />
                <circle cx="200" cy="150" r="12" fill="url(#nodeGrad2)" opacity="0.9" />
                <circle cx="300" cy="100" r="8" fill="url(#nodeGrad1)" opacity="0.9" />
                <circle cx="100" cy="250" r="8" fill="url(#nodeGrad3)" opacity="0.9" />
                <circle cx="200" cy="300" r="10" fill="url(#nodeGrad3)" opacity="0.9" />
                <circle cx="300" cy="250" r="8" fill="url(#nodeGrad3)" opacity="0.9" />
                
                {/* Glows */}
                <circle cx="200" cy="150" r="20" fill="url(#nodeGrad2)" opacity="0.2" />
                <circle cx="200" cy="300" r="18" fill="url(#nodeGrad3)" opacity="0.2" />
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="lineGrad1" x1="0" y1="0" x2="400" y2="400">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8"/>
                  </linearGradient>
                  <linearGradient id="lineGrad2" x1="0" y1="0" x2="0" y2="400">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.6"/>
                  </linearGradient>
                  <radialGradient id="nodeGrad1">
                    <stop offset="0%" stopColor="#00d4ff"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                  </radialGradient>
                  <radialGradient id="nodeGrad2">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#00d4ff"/>
                  </radialGradient>
                  <radialGradient id="nodeGrad3">
                    <stop offset="0%" stopColor="#10b981"/>
                    <stop offset="100%" stopColor="#059669"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ResumeSessionDialog open={showResume} onClose={() => setShowResume(false)} onResumed={onResume} />
      <ReviewSessionsDialog open={showReview} onClose={() => setShowReview(false)} />

      {/* Footer Quote */}
      <footer className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <p className="text-foreground/50 text-sm italic">
          "The secret of getting ahead is getting started." - Mark Twain
        </p>
      </footer>
    </div>
  );
}

