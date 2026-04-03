"use client";

import { useState } from "react";
import { canGenerate, getRemainingGenerations, recordGeneration, getMaxGenerations } from "@/lib/rateLimit";
import { Paywall } from "@/components/Paywall";

interface PromptSectionProps {
  onImageGenerated: (imageUrl: string) => void;
  disabled?: boolean;
}

const EXAMPLE_PROMPTS = [
  "A cyberpunk cat sitting on a neon rooftop at night",
  "Enchanted forest with glowing mushrooms and fireflies",
  "A cozy Japanese ramen shop on a rainy evening",
  "Robot samurai warrior standing in a desert sunset",
  "Underwater city with bioluminescent architecture",
];

export function PromptSection({ onImageGenerated, disabled }: PromptSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  const remaining = getRemainingGenerations();
  const maxGen = getMaxGenerations();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!canGenerate()) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setShowPaywall(false);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 90));
    }, 500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      // Server-side rate limit hit
      if (res.status === 429) {
        setShowPaywall(true);
        setIsGenerating(false);
        setProgress(0);
        clearInterval(progressInterval);
        return;
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }

      recordGeneration();
      setProgress(100);

      setTimeout(() => {
        onImageGenerated(data.imageUrl);
        setIsGenerating(false);
        setProgress(0);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsGenerating(false);
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="space-y-4">
      {/* Prompt Input */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create…"
          disabled={disabled || isGenerating}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 bg-[#0d0d1a]/80 border border-[#2a2a40] rounded-xl
                     text-gray-200 text-sm placeholder-gray-600 resize-none
                     focus:outline-none focus:border-base-blue/50 focus:ring-1 focus:ring-base-blue/20
                     transition-all disabled:opacity-50 font-body"
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-600">
          {prompt.length}/500
        </span>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_PROMPTS.slice(0, 3).map((ex) => (
          <button
            key={ex}
            onClick={() => setPrompt(ex)}
            disabled={isGenerating}
            className="text-[10px] px-2 py-1 bg-[#1a1a2e] text-gray-400 rounded-md
                       hover:bg-base-blue/10 hover:text-base-accent transition-colors
                       truncate max-w-[180px] disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating || disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-3
                   bg-gradient-to-r from-base-blue to-base-purple
                   hover:from-blue-600 hover:to-purple-600
                   text-white font-display text-sm font-bold rounded-xl
                   transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
                   disabled:opacity-40 disabled:hover:scale-100
                   shadow-lg shadow-base-blue/20 relative overflow-hidden"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Generating… {Math.round(progress)}%
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Generate with AI (Free)
          </>
        )}

        {isGenerating && (
          <div
            className="absolute left-0 bottom-0 h-0.5 bg-base-mint transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}
      </button>

      {/* Rate limit + free badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-base-mint/10 text-base-mint px-1.5 py-0.5 rounded font-display">
            FREE
          </span>
          <p className="text-[10px] text-gray-600">
            {remaining}/{maxGen} generations remaining today
          </p>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: maxGen }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-sm ${
                i < remaining ? "bg-base-mint" : "bg-[#2a2a40]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Paywall */}
      {showPaywall && (
        <Paywall
          remaining={remaining}
          total={maxGen}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </div>
  );
}
