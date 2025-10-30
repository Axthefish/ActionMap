'use client';

import { useState } from 'react';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

interface CalibrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalibrationDialog({ isOpen, onClose }: CalibrationDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingNarrative, setStreamingNarrative] = useState('');
  
  const {
    sessionId,
    updatePosition,
    setActionLines,
    setNarrative,
  } = useBlueprintStore();
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please enter your calibration feedback');
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
      const response = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          calibration_feedback: feedback,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calibrate position');
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
            } else if (data.type === 'narrative') {
              // Handle streaming narrative
              setStreamingNarrative(data.text);
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === 'done') {
              // Stream complete
              onClose();
              setFeedback('');
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
        <h2 className="text-2xl font-bold mb-4 text-white">Calibrate Your Position</h2>
        <p className="text-gray-300 mb-6">
          The AI has placed you at an initial position on the blueprint. 
          Does this feel accurate? If not, tell us where you actually are.
        </p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Example: Actually, I'm further along. I already have 5 paying customers..."
            className="w-full h-32 bg-gray-800 text-white border border-gray-600 rounded-lg p-4 mb-4 focus:outline-none focus:border-blue-500 resize-none"
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          
          {isLoading && streamingNarrative && (
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-blue-500">
              <p className="text-sm text-gray-400 mb-2">AI is calibrating...</p>
              <p className="text-white text-sm">{streamingNarrative}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Calibrating...' : 'Calibrate Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
