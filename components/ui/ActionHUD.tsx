'use client';

import { useState } from 'react';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

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
    <div className="h-full overflow-y-auto p-6 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4 text-green-400">Action Center</h2>
      
      {selectedLine ? (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-lg mb-2">{selectedLine.label}</h3>
          <p className="text-gray-300 text-sm">{selectedLine.content}</p>
        </div>
      ) : actionLines.length > 0 ? (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Click on an action line in the 3D view to see details</p>
        </div>
      ) : null}
      
      {isLoading && streamingNarrative && (
        <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
          <p className="text-sm text-blue-400 mb-2">AI is analyzing...</p>
          <p className="text-white text-sm">{streamingNarrative}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Observations & Progress
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="What did you observe after taking action? What worked? What didn't?"
            className="w-full h-32 bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-green-500 resize-none"
            disabled={isLoading || !sessionId}
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          onClick={handleCompleteCycle}
          disabled={isLoading || !sessionId || !observations.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Complete Cycle'}
        </button>
      </div>
      
      {!sessionId && (
        <div className="mt-4 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm">Please initialize a session first</p>
        </div>
      )}
    </div>
  );
}
