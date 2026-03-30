"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";

const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

interface GalleryItem {
  id: string;
  name: string;
  description: string;
  creator: string;
  imageUrl: string;
  tokenId: string;
  contractAddress: string;
  txHash: string;
  timestamp: string;
  mintInfo: {
    pixelSize?: string;
    colorPalette?: string;
    source?: string;
  };
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || "Unknown";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(ts: string): string {
  if (!ts) return "";
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Generate a procedural pixel pattern for items without images */
function generatePixelPattern(index: number, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 320;
  canvas.width = size;
  canvas.height = size;

  const colorSchemes = [
    ["#0052FF", "#00D4FF", "#0a0a2e", "#111144"],
    ["#00FF94", "#00D4FF", "#0a1a0a", "#114411"],
    ["#7B61FF", "#FF6B35", "#1a0a2e", "#2a1144"],
    ["#FF3366", "#FFD700", "#2e0a1a", "#441122"],
    ["#0052FF", "#00FF94", "#0a0a1a", "#001133"],
    ["#FF6B35", "#FFD700", "#1a0a0a", "#331100"],
    ["#00D4FF", "#7B61FF", "#0a0a2e", "#112244"],
    ["#00FF94", "#FF3366", "#0a1a1a", "#224433"],
  ];

  const scheme = colorSchemes[index % colorSchemes.length];
  const pixelSize = [8, 12, 16, 6, 10, 20, 14, 24][index % 8];
  const gridCount = Math.ceil(size / pixelSize);

  let seed = index * 12345 + 6789;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  ctx.fillStyle = scheme[2];
  ctx.fillRect(0, 0, size, size);

  for (let x = 0; x < gridCount; x++) {
    for (let y = 0; y < gridCount; y++) {
      const r = rand();
      if (r > 0.25) {
        const dist = Math.sqrt(
          Math.pow(x - gridCount / 2, 2) + Math.pow(y - gridCount / 2, 2)
        );
        const wave = Math.sin(dist * 0.3 + index * 0.7) * 0.5 + 0.5;
        const diag = Math.sin((x + y) * 0.2 + index) * 0.3 + 0.5;

        if (r < 0.25 + wave * 0.35) {
          ctx.fillStyle = scheme[0];
        } else if (r < 0.55 + diag * 0.2) {
          ctx.fillStyle = scheme[1];
        } else {
          ctx.fillStyle = scheme[3];
        }
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function GalleryCard({
  item,
  index,
}: {
  item: GalleryItem;
  index: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgError, setImgError] = useState(false);
  const hasImage = item.imageUrl && !imgError;

  useEffect(() => {
    if (!hasImage && canvasRef.current) {
      generatePixelPattern(index, canvasRef.current);
    }
  }, [hasImage, index]);

  const basescanUrl = item.txHash
    ? `https://basescan.org/tx/${item.txHash}`
    : item.contractAddress
    ? `https://basescan.org/address/${item.contractAddress}`
    : "#";

  return (
    <a
      href={basescanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square rounded-2xl overflow-hidden bg-[#111122] border border-[#1a1a2e] hover:border-base-blue/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-base-blue/10 animate-fade-up block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image or procedural art */}
      {hasImage ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a15] via-[#0a0a15]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <h4 className="font-display text-xs font-bold text-white truncate">
            {item.name}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-400">
              {shortenAddress(item.creator)}
            </span>
            {item.timestamp && (
              <span className="text-[9px] text-gray-500">
                {timeAgo(item.timestamp)}
              </span>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {item.mintInfo?.pixelSize && (
              <span className="text-[8px] bg-base-blue/20 text-base-blue px-1.5 py-0.5 rounded font-display">
                {item.mintInfo.pixelSize}px
              </span>
            )}
            {item.mintInfo?.colorPalette && (
              <span className="text-[8px] bg-base-accent/20 text-base-accent px-1.5 py-0.5 rounded font-display">
                {item.mintInfo.colorPalette} colors
              </span>
            )}
            {item.mintInfo?.source && (
              <span className="text-[8px] bg-base-mint/20 text-base-mint px-1.5 py-0.5 rounded font-display">
                {item.mintInfo.source}
              </span>
            )}
            {!item.mintInfo?.source && !item.mintInfo?.pixelSize && (
              <span className="text-[8px] bg-base-blue/20 text-base-blue px-1.5 py-0.5 rounded font-display">
                Zora 1155
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data source badge */}
      <div className="absolute top-2 right-2">
        {hasImage ? (
          <span className="text-[8px] font-display font-bold px-1.5 py-0.5 rounded backdrop-blur-sm bg-base-mint/30 text-base-mint">
            ON-CHAIN
          </span>
        ) : (
          <span className="text-[8px] font-display font-bold px-1.5 py-0.5 rounded backdrop-blur-sm bg-base-blue/30 text-base-blue">
            BASE
          </span>
        )}
      </div>

      {/* External link icon */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className="drop-shadow-lg"
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </a>
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/gallery");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch");
      }

      setItems(data.items || []);
      setDataSource(data.source || "unknown");
    } catch (err) {
      console.error("Gallery fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

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
            {"On-Chain "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-base-accent to-base-mint">
              Gallery
            </span>
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Real-time NFTs minted on Base chain via Zora Protocol. Data fetched directly from Basescan + IPFS.
          </p>

          {/* Data source indicator */}
          {dataSource && !loading && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111122] border border-[#1a1a2e] rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-base-mint animate-pulse" />
              <span className="text-[10px] font-display text-gray-400 uppercase tracking-wider">
                Source: {dataSource === "base" ? "Base Chain" : dataSource === "basescan" ? "Basescan" : dataSource}
              </span>
              <span className="text-[10px] text-gray-600">·</span>
              <span className="text-[10px] text-gray-500">
                {items.length} items
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Refresh bar */}
      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 font-display">
              Live on-chain data
            </span>
          </div>
          <button
            onClick={fetchGallery}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111122] border border-[#1a1a2e] rounded-lg text-[10px] text-gray-400 hover:text-white font-display transition-all hover:border-base-blue/30 disabled:opacity-50"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
            </svg>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </section>

      {/* Gallery Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-[#111122] border border-[#1a1a2e] animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a2e]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchGallery}
              className="px-4 py-2 bg-base-blue hover:bg-blue-600 text-white text-xs font-display font-bold rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111122] flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a2a40" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No mints found yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-base-blue/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Your Own
          </Link>
          <p className="text-[10px] text-gray-600">
            Your pixel art will appear here after minting on Base
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-gray-600 font-display">
            {"Pixelon \u00B7 On-Chain Gallery \u00B7 Base"}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`https://basescan.org/address/${ZORA_1155_CREATOR}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display"
            >
              {"Zora Contract \u2197"}
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
