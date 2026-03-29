"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface BeforeAfterSliderProps {
  originalSrc: string;
  pixelCanvas: HTMLCanvasElement;
  pixelSize: number;
}

export function BeforeAfterSlider({
  originalSrc,
  pixelCanvas,
  pixelSize,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelDataUrl, setPixelDataUrl] = useState<string>("");

  useEffect(() => {
    if (pixelCanvas) {
      setPixelDataUrl(pixelCanvas.toDataURL("image/png"));
    }
  }, [pixelCanvas]);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
      setPosition(pct);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, updatePosition]);

  if (!pixelDataUrl) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-base-accent/20 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00D4FF"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <polyline points="8 12 4 12" />
              <polyline points="20 12 16 12" />
            </svg>
          </div>
          <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
            Before / After
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div
        ref={containerRef}
        className={[
          "relative rounded-xl overflow-hidden cursor-col-resize select-none border border-[#1a1a2e]",
          isExpanded ? "aspect-square" : "aspect-[2/1]",
          "transition-all duration-300",
        ].join(" ")}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* After (pixelated) - full background */}
        <img
          src={pixelDataUrl}
          alt="Pixel art"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />

        {/* Before (original) - clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={originalSrc}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: containerRef.current
                ? `${containerRef.current.offsetWidth}px`
                : "100%",
              maxWidth: "none",
            }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white/80 shadow-lg z-10"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center border border-white/30">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="2.5"
            >
              <polyline points="8 4 4 12 8 20" />
              <polyline points="16 4 20 12 16 20" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 z-20">
          <span className="text-[9px] font-display font-bold text-white/80 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            ORIGINAL
          </span>
        </div>
        <div className="absolute top-2 right-2 z-20">
          <span className="text-[9px] font-display font-bold text-base-mint bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {pixelSize}px PIXEL
          </span>
        </div>
      </div>
    </div>
  );
}
