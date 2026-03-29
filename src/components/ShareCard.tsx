"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Hash } from "viem";

interface ShareCardProps {
  canvas: HTMLCanvasElement;
  name: string;
  pixelSize: number;
  colorLimit: number;
  mode: "upload" | "ai";
  txHash?: Hash;
  onClose: () => void;
}

export function ShareCard({
  canvas,
  name,
  pixelSize,
  colorLimit,
  mode,
  txHash,
  onClose,
}: ShareCardProps) {
  const cardRef = useRef<HTMLCanvasElement>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Generate the share card canvas
  useEffect(() => {
    if (!canvas || !cardRef.current) return;

    const card = cardRef.current;
    const ctx = card.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    card.width = W;
    card.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(0.5, "#0d0d2a");
    bg.addColorStop(1, "#0a0a1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Pixel grid pattern
    ctx.strokeStyle = "rgba(0, 82, 255, 0.06)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Glow effect behind the image
    const glow = ctx.createRadialGradient(340, H / 2, 50, 340, H / 2, 300);
    glow.addColorStop(0, "rgba(0, 82, 255, 0.15)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Pixel art image - centered left side
    const imgSize = 380;
    const imgX = 80;
    const imgY = (H - imgSize) / 2;

    // Image border glow
    ctx.shadowColor = "rgba(0, 82, 255, 0.4)";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#111122";
    roundRect(ctx, imgX - 4, imgY - 4, imgSize + 8, imgSize + 8, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw pixel art
    ctx.imageSmoothingEnabled = false;
    roundRect(ctx, imgX, imgY, imgSize, imgSize, 12);
    ctx.save();
    ctx.clip();
    ctx.drawImage(canvas, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    // Image border
    ctx.strokeStyle = "rgba(0, 82, 255, 0.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, imgX, imgY, imgSize, imgSize, 12);
    ctx.stroke();

    // Right side content
    const textX = 520;

    // Pixelon logo area
    drawPixelGrid(ctx, textX, 100, 28);
    
    ctx.font = "bold 32px 'Space Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Pixelon", textX + 40, 120);

    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillStyle = "#666";
    ctx.letterSpacing = "3px";
    ctx.fillText("PIXEL ART NFT ON BASE", textX + 40, 140);

    // Name
    ctx.font = "bold 28px 'DM Sans', sans-serif";
    ctx.fillStyle = "#ffffff";
    const displayName = name.length > 24 ? name.slice(0, 24) + "…" : name;
    ctx.fillText(displayName || "Pixelon Creation", textX, 220);

    // Divider
    const divGrad = ctx.createLinearGradient(textX, 0, textX + 400, 0);
    divGrad.addColorStop(0, "#0052FF");
    divGrad.addColorStop(0.5, "#00D4FF");
    divGrad.addColorStop(1, "#00FF94");
    ctx.fillStyle = divGrad;
    ctx.fillRect(textX, 240, 300, 2);

    // Stats
    const stats = [
      { label: "PIXEL SIZE", value: `${pixelSize}px`, color: "#0052FF" },
      { label: "COLORS", value: colorLimit === 0 ? "Full" : `${colorLimit}`, color: "#00D4FF" },
      { label: "SOURCE", value: mode === "ai" ? "AI" : "Upload", color: "#00FF94" },
      { label: "CHAIN", value: "Base", color: "#7B61FF" },
    ];

    stats.forEach((stat, i) => {
      const sx = textX + (i % 2) * 180;
      const sy = 280 + Math.floor(i / 2) * 70;

      ctx.font = "9px 'Space Mono', monospace";
      ctx.fillStyle = "#555";
      ctx.fillText(stat.label, sx, sy);

      ctx.font = "bold 20px 'Space Mono', monospace";
      ctx.fillStyle = stat.color;
      ctx.fillText(stat.value, sx, sy + 24);
    });

    // Minted badge
    ctx.fillStyle = "rgba(0, 255, 148, 0.1)";
    roundRect(ctx, textX, 440, 130, 28, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 255, 148, 0.3)";
    ctx.lineWidth = 1;
    roundRect(ctx, textX, 440, 130, 28, 6);
    ctx.stroke();

    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillStyle = "#00FF94";
    ctx.fillText("✦ MINTED ON BASE", textX + 12, 458);

    // Bottom bar
    ctx.fillStyle = "rgba(26, 26, 46, 0.8)";
    ctx.fillRect(0, H - 50, W, 50);
    ctx.strokeStyle = "rgba(42, 42, 64, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 50);
    ctx.lineTo(W, H - 50);
    ctx.stroke();

    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillStyle = "#555";
    ctx.fillText("pixelon.base.dev", 80, H - 22);

    if (txHash) {
      ctx.fillStyle = "#444";
      ctx.font = "9px 'Space Mono', monospace";
      ctx.fillText(`tx: ${txHash.slice(0, 16)}…`, W - 250, H - 22);
    }

    setCardDataUrl(card.toDataURL("image/png"));
  }, [canvas, name, pixelSize, colorLimit, mode, txHash]);

  const handleDownload = useCallback(() => {
    if (!cardDataUrl) return;
    const link = document.createElement("a");
    link.download = `pixelon-${name || "creation"}-share.png`;
    link.href = cardDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [cardDataUrl, name]);

  const handleCopyImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const blob = await new Promise<Blob>((res) =>
        cardRef.current!.toBlob((b) => res(b!), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const blob = await new Promise<Blob>((res) =>
        cardRef.current!.toBlob((b) => res(b!), "image/png")
      );
      const file = new File([blob], "pixelon-share.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${name || "Pixelon Creation"} — Pixel Art NFT`,
          text: `I just minted pixel art on Base with Pixelon! 🎨✨`,
          files: [file],
        });
        setShared(true);
      } else {
        handleCopyImage();
      }
    } catch {
      // cancelled
    }
  }, [name, handleCopyImage]);

  const handleTweet = useCallback(() => {
    const text = encodeURIComponent(
      `I just minted pixel art on Base with @pixelon_base! 🎨✨\n\n${
        txHash ? `https://basescan.org/tx/${txHash}` : "https://pixelon.base.dev"
      }`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }, [txHash]);

  const handleWarpcast = useCallback(() => {
    const text = encodeURIComponent(
      `I just minted pixel art on Base with Pixelon! 🎨✨`
    );
    const embed = encodeURIComponent(
      txHash
        ? `https://basescan.org/tx/${txHash}`
        : "https://pixelon.base.dev"
    );
    window.open(
      `https://warpcast.com/~/compose?text=${text}&embeds[]=${embed}`,
      "_blank"
    );
  }, [txHash]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-2xl bg-[#111122] border border-[#2a2a40] rounded-2xl overflow-hidden shadow-2xl">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-base-mint" />
            <span className="font-display text-xs font-bold text-gray-300">
              Share Your Creation
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card preview */}
        <div className="p-4">
          <div className="rounded-xl overflow-hidden border border-[#1a1a2e]">
            {cardDataUrl ? (
              <img
                src={cardDataUrl}
                alt="Share card"
                className="w-full"
              />
            ) : (
              <div className="aspect-[1200/630] bg-[#0a0a15] animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-600">Generating card…</span>
              </div>
            )}
          </div>

          {/* Hidden canvas */}
          <canvas ref={cardRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-3">
          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTweet}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#0a0a15] border border-[#2a2a40] rounded-xl text-xs text-gray-300 hover:text-white hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/10 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </button>
            <button
              onClick={handleWarpcast}
              className="flex items-center justify-center gap-2 py-2.5 bg-[#0a0a15] border border-[#2a2a40] rounded-xl text-xs text-gray-300 hover:text-white hover:border-base-purple/40 hover:bg-base-purple/10 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              Cast on Warpcast
            </button>
          </div>

          {/* Utility buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-base-blue hover:bg-blue-600 text-white rounded-xl text-xs font-display font-bold transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Card
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a15] border border-[#2a2a40] rounded-xl text-xs text-gray-300 hover:text-white hover:border-base-accent/30 transition-all"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper: draw pixel grid logo
function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const s = size / 3;
  const colors = [
    ["#0052FF", "#00D4FF", "#0052FF99"],
    ["#00D4FF99", "#00FF94", "#00D4FF"],
    ["#0052FF4D", "#0052FF99", "#0052FF"],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = colors[r][c];
      ctx.fillRect(x + c * (s + 1), y - size + r * (s + 1), s, s);
    }
  }
}
