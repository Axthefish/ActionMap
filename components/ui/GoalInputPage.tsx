"use client";

import { useState } from "react";
import { useBlueprintStore } from "@/lib/store/blueprintStore";

interface GoalInputPageProps {
  onComplete: () => void;
}

export default function GoalInputPage({ onComplete }: GoalInputPageProps) {
  const [userGoal, setUserGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setSessionId,
    setBlueprintDefinition,
    updatePosition,
    setNarrative,
    setActionLines,
  } = useBlueprintStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedGoal = userGoal.trim();

    if (!trimmedGoal) {
      setError("Please describe your ambition");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Immediately transition to dashboard
    onComplete();

    try {
      const response = await fetch("/api/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userGoal }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize blueprint");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

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

            if (data.type === "blueprint") {
              setSessionId(data.data.session_id);
              setBlueprintDefinition(
                data.data.visual_engine_commands.payload.blueprint_definition
              );
              updatePosition(
                data.data.visual_engine_commands.payload.initial_hypothesis
                  .suggested_position_on_path
              );
              // Set initial action lines if provided
              const initialActionLines = data.data.visual_engine_commands.payload.initial_hypothesis
                ?.initial_action_lines || [];
              setActionLines(initialActionLines);
            } else if (data.type === "narrative") {
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === "done") {
              // Already transitioned to dashboard
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
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
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
          <span className="text-2xl font-bold text-foreground">Dynamic Blueprint</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl w-full px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-foreground">
              What's Your Ambition?
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Describe your aspiration in your own words. The more detail, the
              better our AI can help you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="e.g., 'I want to become a better public speaker to advance in my career' or 'I feel stuck and want to find a more fulfilling professional path.'"
                className="w-full h-48 glass-strong text-foreground border border-white/20 rounded-2xl p-6 text-lg
                         focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20
                         resize-none placeholder:text-foreground/40 transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-destructive text-center font-medium">{error}</p>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !userGoal.trim()}
                className="px-12 py-4 bg-primary hover:bg-primary/90 disabled:bg-border text-white
                         font-semibold text-lg rounded-xl transition-all duration-200
                         hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? "Analyzing..." : "Analyze My Goal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

