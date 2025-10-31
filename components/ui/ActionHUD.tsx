"use client";

import { useState } from "react";
import { useBlueprintStore } from "@/lib/store/blueprintStore";
import { Button } from "@/components/ui/button";

export default function ActionHUD() {
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingNarrative, setStreamingNarrative] = useState('');
  
  const {
    sessionId,
    selectedActionLineId,
    actionLines,
    updatePosition,
    setActionLines,
    setNarrative,
    incrementCycleIndex,
  } = useBlueprintStore();
  
  const selectedLine = actionLines.find(line => line.line_id === selectedActionLineId);
  
  const handleCompleteCycle = async () => {
    if (!observations.trim()) {
      setError('Please enter your observations');
      return;
    }
    
    if (!sessionId) {
      setError('No active session');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStreamingNarrative('');
    
    try {
      const response = await fetch('/api/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_observations: observations,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete cycle');
      }
      
      if (!response.body) {
        throw new Error('No response body');
      }
      
      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'commands') {
              // Handle visual commands
              updatePosition(data.data.payload.new_arrow_position);
              setActionLines(data.data.payload.new_action_lines_to_draw);
              incrementCycleIndex();
            } else if (data.type === 'narrative') {
              // Handle streaming narrative
              setStreamingNarrative(data.text);
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === 'done') {
              // Stream complete, clear observations
              setObservations('');
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          }
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Actions</h2>
        <span className="text-xs text-foreground/50">Cycle #{useBlueprintStore.getState().activeCycleIndex + 1}</span>
      </div>
      
      {selectedLine ? (
        <div className="mb-6 rounded border border-white/10 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold">{selectedLine.label}</h3>
          <p className="text-sm text-foreground/80">{selectedLine.content}</p>
        </div>
      ) : actionLines.length > 0 ? (
        <div className="mb-6 rounded bg-foreground/5 p-4 border border-white/10">
          <p className="text-foreground/70">Click on an action line in the 3D view to see details</p>
        </div>
      ) : null}
      
      {isLoading && streamingNarrative && (
        <div className="mb-6 rounded border border-primary/40 bg-foreground/5 p-4">
          <p className="mb-2 text-sm text-foreground/70">AI is analyzing...</p>
          <p className="text-sm">{streamingNarrative}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/80">Observations</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="What did you observe after taking action? What worked? What didn't?"
            className="h-32 w-full resize-none rounded border border-white/10 bg-foreground/5 p-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30"
            disabled={isLoading || !sessionId}
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <Button
          onClick={handleCompleteCycle}
          disabled={isLoading || !sessionId || !observations.trim()}
          className="w-full bg-foreground text-background hover:bg-foreground/90"
        >
          {isLoading ? 'Processing...' : 'Complete Cycle'}
        </Button>
      </div>
      
      {!sessionId && (
        <div className="mt-4 rounded border border-white/10 bg-foreground/5 p-4">
          <p className="text-sm text-foreground/70">Please initialize a session first</p>
        </div>
      )}
    </div>
  );
}
