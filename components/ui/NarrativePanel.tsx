'use client';

import { useEffect, useState } from 'react';
import { useBlueprintStore } from '@/lib/store/blueprintStore';
import ReactMarkdown from 'react-markdown';

export default function NarrativePanel() {
  const narrative = useBlueprintStore((state) => state.narrative);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Typewriter effect
  useEffect(() => {
    if (!narrative) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20); // Typing speed
    
    return () => clearInterval(interval);
  }, [narrative]);
  
  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4 text-blue-400">Strategic Briefing</h2>
      
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{displayedText}</ReactMarkdown>
        {isTyping && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>}
      </div>
      
      {!narrative && (
        <p className="text-gray-500 italic">Waiting for blueprint initialization...</p>
      )}
    </div>
  );
}

