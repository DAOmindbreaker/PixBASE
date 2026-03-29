"use client";

import { useState, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";
import { WalletButton } from "@/components/WalletButton";
import { UploadSection } from "@/components/UploadSection";
import { PromptSection } from "@/components/PromptSection";
import { PixelPreview } from "@/components/PixelPreview";
import { PixelControls } from "@/components/PixelControls";
import { MintButton } from "@/components/MintButton";
import type { PixelateOptions } from "@/lib/pixelate";

type TabMode = "upload" | "ai";

export default function Home() {
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [activeTab, setActiveTab] = useState<TabMode>("upload");
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [pixelOptions, setPixelOptions] = useState<PixelateOptions>({
    pixelSize: 16,
    colorLimit: 0,
    brightness: 0,
    contrast: 1.0,
  });
  const [pixelCanvas, setPixelCanvas] = useState<HTMLCanvasElement | null>(null);

  // Reset key: increments after mint to force remount all child components
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (isConnected && chain && chain.id !== 8453) {
      try {
        switchChain({ chainId: 8453 });
      } catch (e) {
        console.error("Auto switch failed:", e);
      }
    }
  }, [isConnected, chain]);

  const handleImageLoaded = useCallback((dataUrl: string) => {
    setImageSource(dataUrl);
  }, []);

  const handleAiGenerated = useCallback((imageUrl: string) => {
    setImageSource(imageUrl);
    setAiPrompt("");
  }, []);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setPixelCanvas(canvas);
  }, []);

  const handleMintComplete = useCallback(() => {
    setImageSource(null);
    setPixelCanvas(null);
    setAiPrompt("");
    setPixelOptions({
      pixelSize: 16,
      colorLimit: 0,
      brightness: 0,
      contrast: 1.0,
    });
    // Increment key to force remount UploadSection, PromptSection, PixelPreview
    setResetKey((k) => k + 1);
  }, []);

  const handleImageRemoved = useCallback(() => {
    setImageSource(null);
    setPixelCanvas(null);
  }, []);

  return (
    <div className="relative min-h-screen z-10">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#1a1a2e]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full">
                <div className="bg-base-blue rounded-[2px]" />
                <div className="bg-base-accent rounded-[2px]" />
                <div className="bg-base-blue/60 rounded-[2px]" />
                <div className="bg-base-accent/60 rounded-[2px]" />
                <div className="bg-base-mint rounded-[2px]" />
                <div className="bg-base-accent rounded-[2px]" />
                <div className="bg-base-blue/30 rounded-[2px]" />
                <div className="bg-base-blue/60 rounded-[2px]" />
                <div className="bg-base-blue rounded-[2px]" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-white tracking-tight">
                Pixelon
              </h1>
              <p className="text-[9px] text-gray-500 font-display uppercase tracking-widest">
                Pixel NFT Generator
              </p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="text-center space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            {"Turn anything into "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-base-accent to-base-mint">
              pixel art
            </span>
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Upload an image or describe one with AI. Customize the pixel style, then mint it as an NFT on Base.
          </p>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex gap-1 p-1 bg-[#111122] rounded-xl border border-[#1a1a2e]">
              <button
                onClick={() => setActiveTab("upload")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg",
                  "font-display text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === "upload"
                    ? "bg-base-blue text-white shadow-md shadow-base-blue/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a2e]",
                ].join(" ")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Upload
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg",
                  "font-display text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === "ai"
                    ? "bg-gradient-to-r from-base-blue to-base-purple text-white shadow-md"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a2e]",
                ].join(" ")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                AI Prompt
              </button>
            </div>

            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl">
              {activeTab === "upload" ? (
                <UploadSection
                  key={`upload-${resetKey}`}
                  onImageLoaded={handleImageLoaded}
                  onImageRemoved={handleImageRemoved}
                />
              ) : (
                <PromptSection
                  key={`prompt-${resetKey}`}
                  onImageGenerated={handleAiGenerated}
                />
              )}
            </div>

            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl">
              <PixelControls
                options={pixelOptions}
                onChange={setPixelOptions}
                disabled={!imageSource}
              />
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl">
              <PixelPreview
                key={`preview-${resetKey}`}
                imageSource={imageSource}
                options={pixelOptions}
                onCanvasReady={handleCanvasReady}
              />
            </div>

            <MintButton
              canvas={pixelCanvas}
              pixelSize={pixelOptions.pixelSize}
              colorLimit={pixelOptions.colorLimit}
              mode={activeTab}
              prompt={activeTab === "ai" ? aiPrompt : undefined}
              onMintComplete={handleMintComplete}
            />

            {!imageSource && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-base-blue/10 flex items-center justify-center mb-3">
                    <span className="text-lg">{"\uD83C\uDFA8"}</span>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-300 mb-1">Create</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Upload any image or generate one from a text prompt using AI
                  </p>
                </div>
                <div className="p-4 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-base-accent/10 flex items-center justify-center mb-3">
                    <span className="text-lg">{"\u26A1"}</span>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-300 mb-1">Pixelate</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Fine-tune pixel size, color palette, and effects in real time
                  </p>
                </div>
                <div className="p-4 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-base-mint/10 flex items-center justify-center mb-3">
                    <span className="text-lg">{"\uD83D\uDC8E"}</span>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-300 mb-1">Mint</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Mint your pixel art as an NFT on Base with low gas via Zora
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== AI AGENT BADGE ===== */}
      <section className="max-w-5xl mx-auto px-4 pb-6 relative z-10">
        <a
          href="/agent"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-gradient-to-r from-[#111122] to-[#0d0d1a] border border-[#2a2a40] rounded-2xl hover:border-base-blue/30 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-base-blue/10 flex items-center justify-center relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-base-mint border-2 border-[#0d0d1a] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold text-gray-300">AI Agent</span>
                  <span className="text-[8px] bg-base-mint/15 text-base-mint px-1.5 py-0.5 rounded font-display font-bold uppercase tracking-wider">x402</span>
                  <span className="text-[8px] bg-base-blue/15 text-base-blue px-1.5 py-0.5 rounded font-display font-bold uppercase tracking-wider">ERC-8004</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  {"pixelon.base.eth \u00B7 Accepts USDC payments via x402 protocol"}
                </p>
              </div>
            </div>
            <div className="text-[10px] text-gray-600 group-hover:text-base-accent transition-colors font-display hidden sm:block">
              {"View SKILL.md \u2192"}
            </div>
          </div>
        </a>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1a1a2e] py-6 relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 font-display">
            {"Built on Base \u00B7 Powered by Zora"}
          </p>
          <div className="flex gap-4">
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"Base \u2197"}
            </a>
            <a
              href="https://zora.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"Zora \u2197"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
