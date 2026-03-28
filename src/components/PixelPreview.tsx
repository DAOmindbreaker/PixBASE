"use client";

import { useEffect, useRef, useCallback } from "react";
import { pixelateImage, loadImage, downloadCanvas, type PixelateOptions } from "@/lib/pixelate";

interface PixelPreviewProps {
  imageSource: string | null; // data URL or remote URL
  options: PixelateOptions;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export function PixelPreview({ imageSource, options, onCanvasReady }: PixelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load and process image whenever source or options change
  const processImage = useCallback(async () => {
    if (!imageSource || !canvasRef.current) return;

    try {
      // Load image if not cached or source changed
      if (!imageRef.current || imageRef.current.src !== imageSource) {
        imageRef.current = await loadImage(imageSource);
      }

      // Run pixelation
      pixelateImage(imageRef.current, canvasRef.current, options);

      // Notify parent canvas is ready
      onCanvasReady?.(canvasRef.current);
    } catch (err) {
      console.error("Pixelation error:", err);
    }
  }, [imageSource, options, onCanvasReady]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const timestamp = Date.now().toString(36);
      downloadCanvas(canvasRef.current, `pixbase-${timestamp}.png`);
    }
  };

  if (!imageSource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]
                      border-2 border-dashed border-[#1a1a2e] rounded-2xl bg-[#0a0a15]/50">
        <div className="w-16 h-16 rounded-2xl bg-[#111122] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1" className="text-[#2a2a40]">
            {/* Pixel grid icon */}
            <rect x="3" y="3" width="4" height="4" fill="currentColor" />
            <rect x="10" y="3" width="4" height="4" fill="currentColor" opacity="0.6" />
            <rect x="17" y="3" width="4" height="4" fill="currentColor" opacity="0.3" />
            <rect x="3" y="10" width="4" height="4" fill="currentColor" opacity="0.6" />
            <rect x="10" y="10" width="4" height="4" fill="currentColor" />
            <rect x="17" y="10" width="4" height="4" fill="currentColor" opacity="0.6" />
            <rect x="3" y="17" width="4" height="4" fill="currentColor" opacity="0.3" />
            <rect x="10" y="17" width="4" height="4" fill="currentColor" opacity="0.6" />
            <rect x="17" y="17" width="4" height="4" fill="currentColor" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 font-display">Pixel preview will appear here</p>
        <p className="text-xs text-gray-700 mt-1">Upload an image or generate with AI</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            <span className="text-[10px] font-display text-gray-500 uppercase tracking-wider">
              Original
            </span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-[#0a0a15] border border-[#1a1a2e]
                          flex items-center justify-center min-h-[200px]">
            <img
              src={imageSource}
              alt="Original"
              className="max-w-full max-h-[280px] object-contain"
            />
          </div>
        </div>

        {/* Pixelated */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-base-mint" />
            <span className="text-[10px] font-display text-base-mint uppercase tracking-wider">
              Pixel Art
            </span>
            <div className="ml-auto flex items-center gap-1 text-[9px] text-gray-600 font-display">
              <span>1080×1080</span>
              <span>·</span>
              <span>{options.pixelSize}px</span>
              <span>·</span>
              <span>{options.colorLimit || "Full"} colors</span>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-[#0a0a15] border border-base-blue/20
                          flex items-center justify-center min-h-[200px]
                          shadow-lg shadow-base-blue/5">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[280px] object-contain"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Pixel overlay effect */}
            <div className="absolute inset-0 pointer-events-none
                            bg-gradient-to-t from-[#0a0a15]/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5
                     bg-[#111122] border border-[#2a2a40] rounded-xl
                     text-sm text-gray-300 hover:text-white hover:border-[#3a3a55]
                     transition-all hover:bg-[#161630]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PNG
        </button>

        {/* Share */}
        <button
          onClick={async () => {
            if (!canvasRef.current) return;
            try {
              const blob = await new Promise<Blob>((res) =>
                canvasRef.current!.toBlob((b) => res(b!), "image/png")
              );
              const file = new File([blob], "pixbase.png", { type: "image/png" });
              if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: "PixBASE Creation",
                  text: "Check out my pixel art from PixBASE!",
                  files: [file],
                });
              } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob }),
                ]);
                alert("Pixel art copied to clipboard!");
              }
            } catch (err) {
              console.error("Share failed:", err);
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5
                     bg-[#111122] border border-[#2a2a40] rounded-xl
                     text-sm text-gray-300 hover:text-white hover:border-[#3a3a55]
                     transition-all hover:bg-[#161630]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
