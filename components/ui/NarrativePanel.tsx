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
    const step = 2; // type 2 chars per tick to reduce reflow
    const interval = setInterval(() => {
      if (currentIndex < narrative.length) {
        setDisplayedText(narrative.slice(0, currentIndex + step));
        currentIndex += step;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 24);
    
    return () => clearInterval(interval);
  }, [narrative]);
  
  return (
    <div className="h-full overflow-y-auto p-6 glass-strong border-r border-border/20">
      <h2 className="text-apple-h2 font-semibold mb-4 text-foreground">
        Strategic Briefing
      </h2>
      
      <div className="prose prose-invert max-w-none text-apple-body leading-8 tracking-[-0.005em] prose-p:mb-4 prose-ol:my-3 prose-ul:my-3 prose-li:my-1">
        <ReactMarkdown 
          components={{
            h1: ({children}) => <h1 className="text-apple-h1 font-bold mb-4 text-foreground">{children}</h1>,
            h2: ({children}) => <h2 className="text-apple-h2 font-semibold mb-3 text-foreground">{children}</h2>,
            h3: ({children}) => <h3 className="text-apple-h3 font-semibold mb-2 text-foreground">{children}</h3>,
            p: ({children}) => <p className="mb-3 text-foreground/90">{children}</p>,
            strong: ({children}) => <strong className="text-foreground font-semibold">{children}</strong>,
            em: ({children}) => <em className="text-foreground/80">{children}</em>,
            ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
            li: ({children}) => <li className="text-foreground/80">{children}</li>,
          }}
        >
          {displayedText}
        </ReactMarkdown>
        {isTyping && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 rounded-sm"></span>
        )}
      </div>
      
      {!narrative && (
        <p className="text-foreground/50 italic text-apple-caption">
          Waiting for blueprint initialization...
        </p>
      )}
    </div>
  );
}

