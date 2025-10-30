"use client";

import { useState } from "react";
import { useBlueprintStore } from "@/lib/store/blueprintStore";

export default function GoalInputPage() {
  const [userGoal, setUserGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingNarrative, setStreamingNarrative] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    setSessionId,
    setBlueprintDefinition,
    updatePosition,
    setNarrative,
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
    setStreamingNarrative("");

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
            } else if (data.type === "narrative") {
              setStreamingNarrative(data.text);
              if (data.isComplete) {
                setNarrative(data.text);
              }
            } else if (data.type === "done") {
              setShowSuccess(true);
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
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#1f2937] to-[#111827] flex items-center justify-center">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
          <span className="text-2xl font-bold text-foreground">Dynamic Blueprint</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-lg glass text-foreground/80 hover:text-foreground transition">
            Help
          </button>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <span className="text-lg">🔔</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-foreground font-semibold">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl w-full px-8">
        {showSuccess ? (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-4xl font-bold text-success">
              Blueprint Generated Successfully!
            </h1>
            <p className="text-xl text-foreground/70">
              Preparing your strategic visualization...
            </p>
          </div>
        ) : (
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

              {isLoading && streamingNarrative && (
                <div className="p-6 glass rounded-2xl border border-primary/30 space-y-3">
                  <p className="text-primary font-medium">
                    AI is analyzing your ambition...
                  </p>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    {streamingNarrative}
                  </p>
                </div>
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
        )}
      </div>
    </div>
  );
}

