"use client";

import { useState } from "react";
import { useBlueprintStore } from "@/lib/store/blueprintStore";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isDemo, simulateCalibration } from "@/lib/demo";

interface CalibrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalibrationDialog({ isOpen, onClose }: CalibrationDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingNarrative, setStreamingNarrative] = useState("");
  
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
      setError("Please enter your calibration feedback");
      return;
    }
    
    if (!sessionId && !isDemo()) {
      setError("No active session");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setStreamingNarrative("");
    
    try {
      if (isDemo()) {
        const currentNarrative = useBlueprintStore.getState().narrative;
        await simulateCalibration(feedback, (chunk, done) => {
          setStreamingNarrative((prev) => (prev ? prev + chunk : chunk));
          if (done) {
            const updatedNarrative = currentNarrative ? currentNarrative + "\n" + chunk : chunk;
            setNarrative(updatedNarrative);
          }
        });
        onClose();
        setFeedback("");
        return;
      }
      const response = await fetch("/api/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          calibration_feedback: feedback,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calibrate position");
      }
      
      if (!response.body) {
        throw new Error("No response body");
      }
      
      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === "commands") {
              // Handle visual commands
              updatePosition(data.data.payload.new_arrow_position);
              setActionLines(data.data.payload.new_action_lines_to_draw);
            } else if (data.type === "narrative") {
              // Handle streaming narrative
              setStreamingNarrative(data.text);
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === "done") {
              // Stream complete
              onClose();
              setFeedback("");
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          }
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Calibrate Your Position</DialogTitle>
        <DialogDescription>
          The AI has placed you at an initial position on the blueprint. Does this feel accurate?
          If not, tell us where you actually are.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Example: Actually, I'm further along. I already have 5 paying customers..."
          className="mb-4 h-32 w-full resize-none rounded border border-white/10 bg-foreground/5 p-4 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/60"
          disabled={isLoading}
        />

        {error && <p className="mb-4 text-destructive">{error}</p>}

        {isLoading && streamingNarrative && (
          <div className="mb-4 rounded border border-primary/40 bg-foreground/5 p-3">
            <p className="mb-2 text-xs text-foreground/60">AI is calibrating...</p>
            <p className="text-sm">{streamingNarrative}</p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
            Skip
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Calibrating..." : "Calibrate Position"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
