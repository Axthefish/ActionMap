'use client';

import { useState } from 'react';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

interface InitWizardProps {
  onInitComplete: () => void;
}

export default function InitWizard({ onInitComplete }: InitWizardProps) {
  const [userGoal, setUserGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingNarrative, setStreamingNarrative] = useState('');
  
  const {
    setSessionId,
    setBlueprintDefinition,
    updatePosition,
    setNarrative,
  } = useBlueprintStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userGoal.trim()) {
      setError('Please enter your goal');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStreamingNarrative('');
    
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userGoal }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize blueprint');
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
            
            if (data.type === 'blueprint') {
              // Handle blueprint data (for 3D rendering)
              setSessionId(data.data.session_id);
              setBlueprintDefinition(
                data.data.visual_engine_commands.payload.blueprint_definition
              );
              updatePosition(
                data.data.visual_engine_commands.payload.initial_hypothesis.suggested_position_on_path
              );
            } else if (data.type === 'narrative') {
              // Handle streaming narrative text
              setStreamingNarrative(data.text);
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === 'done') {
              // Stream complete
              onInitComplete();
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-white">Welcome to the Strategic Blueprint</h2>
        <p className="text-gray-300 mb-6">
          Let's start by understanding your journey. Describe your goal or the challenge you're working on.
          The AI will generate a strategic blueprint tailored to your situation.
        </p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={userGoal}
            onChange={(e) => setUserGoal(e.target.value)}
            placeholder="Example: I want to build a SaaS product and grow it to $10k MRR..."
            className="w-full h-32 bg-gray-800 text-white border border-gray-600 rounded-lg p-4 mb-4 focus:outline-none focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          
          {isLoading && streamingNarrative && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-blue-500">
              <p className="text-sm text-gray-400 mb-2">AI is generating your blueprint...</p>
              <p className="text-white text-sm">{streamingNarrative}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Generating Blueprint...' : 'Generate My Blueprint'}
          </button>
        </form>
      </div>
    </div>
  );
}
