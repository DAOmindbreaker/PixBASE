"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

interface GalleryItem {
  id: string;
  name: string;
  creator: string;
  imageUrl: string;
  pixelSize: number;
  colorPalette: string;
  source: string;
  chain: string;
  txHash: string;
  timestamp: number;
}

// Basescan-based fetching for real on-chain data
const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Generate sample gallery items (in production, these would come from an indexer)
function generateSampleGallery(): GalleryItem[] {
  const names = [
    "Cyber Sunset", "Neon Cat", "Pixel Mountain", "8-Bit Dreams",
    "Digital Forest", "Retro Skyline", "Glitch Garden", "Quantum Bloom",
    "Synthwave Tiger", "Voxel Valley", "Matrix Rain", "Crystal Cave",
  ];
  const pixelSizes = [4, 8, 16, 24, 32, 48];
  const palettes = ["Full", "4", "8", "16", "32", "64"];
  const sources = ["AI Generated", "Uploaded"];
  const now = Math.floor(Date.now() / 1000);

  return names.map((name, i) => ({
    id: `gallery-${i}`,
    name,
    creator: `0x${((i + 1) * 1111).toString(16).padStart(4, "0")}${"a".repeat(36)}${((i + 3) * 777).toString(16).padStart(4, "0")}`,
    imageUrl: "",
    pixelSize: pixelSizes[i % pixelSizes.length],
    colorPalette: palettes[i % palettes.length],
    source: sources[i % sources.length],
    chain: "Base",
    txHash: `0x${Math.random().toString(16).slice(2)}`,
    timestamp: now - (i + 1) * 3600 * (1 + Math.floor(Math.random() * 5)),
  }));
}

// Generate pixel art pattern for gallery thumbnails
function generatePixelPattern(index: number, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 240;
  canvas.width = size;
  canvas.height = size;

  const colorSchemes = [
    ["#0052FF", "#00D4FF", "#0a0a2e", "#111144"],
    ["#00FF94", "#00D4FF", "#0a1a0a", "#114411"],
    ["#7B61FF", "#FF6B35", "#1a0a2e", "#2a1144"],
    ["#FF3366", "#FFD700", "#2e0a1a", "#441122"],
    ["#0052FF", "#00FF94", "#0a0a1a", "#001133"],
    ["#FF6B35", "#FFD700", "#1a0a0a", "#331100"],
  ];

  const scheme = colorSchemes[index % colorSchemes.length];
  const pixelSize = [8, 12, 16, 6, 10, 20][index % 6];
  const gridCount = Math.ceil(size / pixelSize);

  // Seed-based pseudo-random
  let seed = index * 12345 + 6789;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Background
  ctx.fillStyle = scheme[2];
  ctx.fillRect(0, 0, size, size);

  // Pattern
  for (let x = 0; x < gridCount; x++) {
    for (let y = 0; y < gridCount; y++) {
      const r = rand();
      if (r > 0.3) {
        // Create interesting patterns based on position
        const dist = Math.sqrt(
          Math.pow(x - gridCount / 2, 2) + Math.pow(y - gridCount / 2, 2)
        );
        const wave = Math.sin(dist * 0.3 + index) * 0.5 + 0.5;

        if (r < 0.3 + wave * 0.4) {
          ctx.fillStyle = scheme[0];
        } else if (r < 0.6 + wave * 0.2) {
          ctx.fillStyle = scheme[1];
        } else {
          ctx.fillStyle = scheme[3];
        }
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ai" | "upload">("all");
  const [sortBy, setSortBy] = useState<"recent" | "pixelSize">("recent");
  const canvasRefs = useCallback((node: HTMLCanvasElement | null, index: number) => {
    if (node) {
      generatePixelPattern(index, node);
    }
  }, []);

  useEffect(() => {
    // Simulate loading gallery items
    const timer = setTimeout(() => {
      setItems(generateSampleGallery());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = items
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "ai") return item.source === "AI Generated";
      return item.source === "Uploaded";
    })
    .sort((a, b) => {
      if (sortBy === "recent") return b.timestamp - a.timestamp;
      return b.pixelSize - a.pixelSize;
    });

  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#1a1a2e]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
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
                Gallery
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-display text-gray-500 hover:text-base-blue border border-[#1a1a2e] hover:border-base-blue/30 rounded-lg transition-all"
            >
              {"\u2190 Back to App"}
            </Link>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            {"Community "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-base-accent to-base-mint">
              Gallery
            </span>
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Explore pixel art created and minted by the Pixelon community on Base.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Source filter */}
          <div className="flex gap-1 p-1 bg-[#111122] rounded-xl border border-[#1a1a2e]">
            {(["all", "ai", "upload"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  "px-4 py-2 rounded-lg font-display text-[10px] font-bold uppercase tracking-wider transition-all",
                  filter === f
                    ? "bg-base-blue text-white shadow-md"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a2e]",
                ].join(" ")}
              >
                {f === "all" ? "All" : f === "ai" ? "AI Generated" : "Uploaded"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 font-display">Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === "recent" ? "pixelSize" : "recent")}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#111122] border border-[#1a1a2e] rounded-lg text-[10px] text-gray-400 hover:text-white font-display transition-colors"
            >
              {sortBy === "recent" ? "Most Recent" : "Pixel Size"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-[#111122] border border-[#1a1a2e] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#111122] border border-[#1a1a2e] hover:border-base-blue/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-blue/10 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Pixel art thumbnail */}
                <canvas
                  ref={(node) => canvasRefs(node, i)}
                  className="absolute inset-0 w-full h-full"
                  style={{ imageRendering: "pixelated" }}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a15] via-[#0a0a15]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    <h4 className="font-display text-xs font-bold text-white truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400">
                        {shortenAddress(item.creator)}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[8px] bg-base-blue/20 text-base-blue px-1.5 py-0.5 rounded font-display">
                        {item.pixelSize}px
                      </span>
                      <span className="text-[8px] bg-base-accent/20 text-base-accent px-1.5 py-0.5 rounded font-display">
                        {item.colorPalette} colors
                      </span>
                      <span className="text-[8px] bg-base-mint/20 text-base-mint px-1.5 py-0.5 rounded font-display">
                        {item.source === "AI Generated" ? "AI" : "Upload"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Source badge */}
                <div className="absolute top-2 right-2">
                  <span className={[
                    "text-[8px] font-display font-bold px-1.5 py-0.5 rounded backdrop-blur-sm",
                    item.source === "AI Generated"
                      ? "bg-base-purple/30 text-base-purple"
                      : "bg-base-blue/30 text-base-blue",
                  ].join(" ")}>
                    {item.source === "AI Generated" ? "AI" : "📷"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111122] flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a2a40" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No pixel art found with this filter</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-base-blue/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Your Own
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <p className="text-[10px] text-gray-600 font-display">
            {"Pixelon \u00B7 Community Gallery \u00B7 Base"}
          </p>
        </div>
      </footer>
    </div>
  );
}
