"use client";

import { useState, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import { UploadSection } from "@/components/UploadSection";
import { PromptSection } from "@/components/PromptSection";
import { PixelPreview } from "@/components/PixelPreview";
import { PixelControls } from "@/components/PixelControls";
import { MintButton } from "@/components/MintButton";
import { RecentMints } from "@/components/RecentMints";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ShareCard } from "@/components/ShareCard";
import { PixelPlayground } from "@/components/PixelPlayground";
import type { PixelateOptions } from "@/lib/pixelate";
import type { Hash } from "viem";

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
  const [resetKey, setResetKey] = useState(0);

  // Share card state
  const [showShareCard, setShowShareCard] = useState(false);
  const [mintedTxHash, setMintedTxHash] = useState<Hash | undefined>();
  const [mintedName, setMintedName] = useState("");

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
    // Show share card instead of immediately resetting
    if (pixelCanvas) {
      setShowShareCard(true);
    } else {
      setImageSource(null);
      setPixelCanvas(null);
      setAiPrompt("");
      setPixelOptions({ pixelSize: 16, colorLimit: 0, brightness: 0, contrast: 1.0 });
      setResetKey((k) => k + 1);
    }
  }, [pixelCanvas]);

  const handleShareCardClose = useCallback(() => {
    setShowShareCard(false);
    setImageSource(null);
    setPixelCanvas(null);
    setAiPrompt("");
    setMintedTxHash(undefined);
    setMintedName("");
    setPixelOptions({ pixelSize: 16, colorLimit: 0, brightness: 0, contrast: 1.0 });
    setResetKey((k) => k + 1);
  }, []);

  const handleImageRemoved = useCallback(() => {
    setImageSource(null);
    setPixelCanvas(null);
  }, []);

  return (
    <div className="relative min-h-screen z-10">
      {/* Share Card Modal */}
      {showShareCard && pixelCanvas && (
        <ShareCard
          canvas={pixelCanvas}
          name={mintedName || "Pixelon Creation"}
          pixelSize={pixelOptions.pixelSize}
          colorLimit={pixelOptions.colorLimit}
          mode={activeTab}
          txHash={mintedTxHash}
          onClose={handleShareCardClose}
        />
      )}

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#1a1a2e]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full">
                <div className="bg-base-blue rounded-[2px] transition-transform group-hover:scale-110" />
                <div className="bg-base-accent rounded-[2px] transition-transform group-hover:scale-110 delay-[25ms]" />
                <div className="bg-base-blue/60 rounded-[2px] transition-transform group-hover:scale-110 delay-[50ms]" />
                <div className="bg-base-accent/60 rounded-[2px] transition-transform group-hover:scale-110 delay-[75ms]" />
                <div className="bg-base-mint rounded-[2px] transition-transform group-hover:scale-110 delay-[100ms]" />
                <div className="bg-base-accent rounded-[2px] transition-transform group-hover:scale-110 delay-[125ms]" />
                <div className="bg-base-blue/30 rounded-[2px] transition-transform group-hover:scale-110 delay-[150ms]" />
                <div className="bg-base-blue/60 rounded-[2px] transition-transform group-hover:scale-110 delay-[175ms]" />
                <div className="bg-base-blue rounded-[2px] transition-transform group-hover:scale-110 delay-[200ms]" />
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
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/gallery"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-display text-gray-500 hover:text-base-accent border border-[#1a1a2e] hover:border-base-accent/30 rounded-lg transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Gallery
            </Link>
            <Link
              href="/agent"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-display text-gray-500 hover:text-base-accent border border-[#1a1a2e] hover:border-base-accent/30 rounded-lg transition-all"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-base-mint animate-pulse" />
              AI Agent
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-base-blue/5 border border-base-blue/10 rounded-full animate-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-base-blue animate-pulse" />
            <span className="text-[10px] font-display text-gray-400 uppercase tracking-wider">
              Built on Base
            </span>
            <span className="text-[10px] text-gray-600">{"/"}</span>
            <span className="text-[10px] font-display text-gray-400 uppercase tracking-wider">
              Powered by Zora
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight animate-fade-up">
            {"Turn anything into "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-base-accent to-base-mint">
              pixel art
            </span>
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed animate-fade-up">
            Upload an image or generate one with AI. Customize the pixel style in real time, then mint as an NFT on Base with one click.
          </p>

          <div className="flex items-center justify-center gap-6 pt-2 animate-fade-up">
            <div className="text-center">
              <p className="font-display text-sm font-bold text-white">1080px</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Output</p>
            </div>
            <div className="w-px h-6 bg-[#1a1a2e]" />
            <div className="text-center">
              <p className="font-display text-sm font-bold text-base-mint">Free</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">AI Generate</p>
            </div>
            <div className="w-px h-6 bg-[#1a1a2e]" />
            <div className="text-center">
              <p className="font-display text-sm font-bold text-base-accent">ERC-1155</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">NFT Standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-4 space-y-5">
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-[#111122] rounded-xl border border-[#1a1a2e]">
              <button
                onClick={() => setActiveTab("upload")}
                className={[
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg",
                  "font-display text-xs font-bold uppercase tracking-wider transition-all duration-200",
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
                  "font-display text-xs font-bold uppercase tracking-wider transition-all duration-200",
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

            {/* Input Section */}
            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl backdrop-blur-sm">
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

            {/* Pixel Controls */}
            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl backdrop-blur-sm">
              <PixelControls
                options={pixelOptions}
                onChange={setPixelOptions}
                disabled={!imageSource}
              />
            </div>

            {/* Pixel Playground (unique feature) */}
            <PixelPlayground />
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:col-span-8 space-y-5">
            {/* Pixel Preview */}
            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl backdrop-blur-sm">
              <PixelPreview
                key={`preview-${resetKey}`}
                imageSource={imageSource}
                options={pixelOptions}
                onCanvasReady={handleCanvasReady}
              />
            </div>

            {/* Before/After Slider */}
            {imageSource && pixelCanvas && (
              <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl backdrop-blur-sm animate-fade-up">
                <BeforeAfterSlider
                  originalSrc={imageSource}
                  pixelCanvas={pixelCanvas}
                  pixelSize={pixelOptions.pixelSize}
                />
              </div>
            )}

            {/* Mint Section */}
            <MintButton
              canvas={pixelCanvas}
              pixelSize={pixelOptions.pixelSize}
              colorLimit={pixelOptions.colorLimit}
              mode={activeTab}
              prompt={activeTab === "ai" ? aiPrompt : undefined}
              onMintComplete={handleMintComplete}
            />

            {/* Recent Mints Feed */}
            <div className="p-4 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl backdrop-blur-sm">
              <RecentMints />
            </div>

            {/* Feature Cards */}
            {!imageSource && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="group p-5 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl hover:border-base-blue/20 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-base-blue/20 to-base-blue/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-200 mb-1.5">Create</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Upload any image or generate one from a text prompt using AI
                  </p>
                </div>

                <div className="group p-5 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl hover:border-base-accent/20 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-base-accent/20 to-base-accent/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
                      <path d="M12 20V10" />
                      <path d="M18 20V4" />
                      <path d="M6 20v-4" />
                    </svg>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-200 mb-1.5">Pixelate</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Fine-tune pixel size, color palette, and effects in real time
                  </p>
                </div>

                <div className="group p-5 bg-[#111122]/40 border border-[#1a1a2e] rounded-xl hover:border-base-mint/20 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-base-mint/20 to-base-mint/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h4 className="font-display text-xs font-bold text-gray-200 mb-1.5">Mint</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Mint your pixel art as an NFT on Base with low gas via Zora
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== BOTTOM CARDS ===== */}
      <section className="max-w-5xl mx-auto px-4 pb-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/agent"
            className="block p-4 bg-gradient-to-r from-[#111122] to-[#0d0d1a] border border-[#2a2a40] rounded-2xl hover:border-base-blue/30 transition-all duration-300 group hover:-translate-y-0.5"
          >
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
                </div>
                <p className="text-[10px] text-gray-500">Pixel art as a service for AI agents</p>
              </div>
            </div>
          </Link>

          <Link
            href="/gallery"
            className="block p-4 bg-gradient-to-r from-[#0d0d1a] to-[#111122] border border-[#2a2a40] rounded-2xl hover:border-base-accent/30 transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-base-accent/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs font-bold text-gray-300">Gallery</span>
                  <span className="text-[8px] bg-base-accent/15 text-base-accent px-1.5 py-0.5 rounded font-display font-bold uppercase tracking-wider">Public</span>
                </div>
                <p className="text-[10px] text-gray-500">Explore community pixel art creations</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#1a1a2e] py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-3 grid-rows-3 gap-[1px] w-5 h-5 opacity-40">
                <div className="bg-base-blue rounded-[1px]" />
                <div className="bg-base-accent rounded-[1px]" />
                <div className="bg-base-blue/60 rounded-[1px]" />
                <div className="bg-base-accent/60 rounded-[1px]" />
                <div className="bg-base-mint rounded-[1px]" />
                <div className="bg-base-accent rounded-[1px]" />
                <div className="bg-base-blue/30 rounded-[1px]" />
                <div className="bg-base-blue/60 rounded-[1px]" />
                <div className="bg-base-blue rounded-[1px]" />
              </div>
              <p className="text-[10px] text-gray-600 font-display">
                {"Pixelon \u00B7 Pixel Art NFT Generator on Base"}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/gallery" className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display">Gallery</Link>
              <Link href="/agent" className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display">AI Agent</Link>
              <a href="https://basepixelon.vercel.app/.well-known/SKILL.md" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display">SKILL.md</a>
              <a href="https://base.dev" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display">{"base.dev \u2197"}</a>
              <a href="https://zora.co" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display">{"Zora \u2197"}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
