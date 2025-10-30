'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

export default function InfoCard() {
  const infoCardData = useBlueprintStore((state) => state.infoCardData);
  const setInfoCardData = useBlueprintStore((state) => state.setInfoCardData);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setInfoCardData(null);
      }
    };
    
    if (infoCardData) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [infoCardData, setInfoCardData]);
  
  return (
    <AnimatePresence>
      {infoCardData && (
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 
                   max-w-md w-full p-6 glass-strong rounded-xl shadow-lg"
        >
          <button
            onClick={() => setInfoCardData(null)}
            className="absolute top-4 right-4 text-foreground/50 hover:text-foreground 
                     transition-colors p-1 rounded-lg hover:bg-foreground/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="text-apple-h2 font-bold mb-4 text-accent pr-8">{infoCardData.label}</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-apple-caption font-semibold text-foreground/60 uppercase tracking-wide mb-2">
                Core Objective
              </h4>
              <p className="text-foreground/90 leading-relaxed">{infoCardData.content.core_objective}</p>
            </div>
            
            <div>
              <h4 className="text-apple-caption font-semibold text-foreground/60 uppercase tracking-wide mb-2">
                Key Signals
              </h4>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                {infoCardData.content.key_signals.map((signal, idx) => (
                  <li key={idx} className="leading-relaxed">{signal}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

