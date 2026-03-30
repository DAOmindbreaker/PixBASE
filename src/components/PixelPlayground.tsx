"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const GRID_SIZES = [8, 16, 32] as const;
type GridSize = (typeof GRID_SIZES)[number];

const PALETTE = [
  "#0052FF", "#00D4FF", "#00FF94", "#7B61FF", "#FF6B35",
  "#FF3366", "#FFD700", "#FFFFFF", "#888888", "#000000",
  "#1a1a2e", "#0a0a15", "#2563eb", "#16a34a", "#dc2626",
  "#f59e0b",
];

export function PixelPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState<GridSize>(16);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"draw" | "erase" | "fill">("draw");
  const [pixels, setPixels] = useState<Map<string, string>>(new Map());
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const cellSize = Math.floor(320 / gridSize);
  const canvasSize = cellSize * gridSize;

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = canvasSize;
    canvasRef.current.height = canvasSize;

    // Background
    ctx.fillStyle = "#0a0a15";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw pixels
    pixels.forEach((color, key) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });

    // Grid lines
    ctx.strokeStyle = "rgba(42, 42, 64, 0.5)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }
  }, [pixels, gridSize, cellSize, canvasSize]);

  const getGridPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasSize / rect.width;
      const scaleY = canvasSize / rect.height;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const x = Math.floor((clientX - rect.left) * scaleX / cellSize);
      const y = Math.floor((clientY - rect.top) * scaleY / cellSize);
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
      return { x, y };
    },
    [canvasSize, cellSize, gridSize]
  );

  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      const newPixels = new Map(pixels);
      const targetColor = pixels.get(`${startX},${startY}`) || null;
      if (targetColor === fillColor) return;

      const stack: [number, number][] = [[startX, startY]];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;

        const currentColor = pixels.get(key) || null;
        if (currentColor !== targetColor) continue;

        visited.add(key);
        newPixels.set(key, fillColor);

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      setPixels(newPixels);
    },
    [pixels, gridSize]
  );

  const paint = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const pos = getGridPos(e);
      if (!pos) return;
      const key = `${pos.x},${pos.y}`;

      if (tool === "fill") {
        floodFill(pos.x, pos.y, selectedColor);
        return;
      }

      setPixels((prev) => {
        const next = new Map(prev);
        if (tool === "erase") {
          next.delete(key);
        } else {
          next.set(key, selectedColor);
        }
        return next;
      });
    },
    [getGridPos, tool, selectedColor, floodFill]
  );

  // Native touch event listeners (non-passive, so preventDefault works)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    let touching = false;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touching = true;
      setIsDrawing(true);
      paint(e);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (touching) paint(e);
    };
    const onTouchEnd = () => {
      touching = false;
      setIsDrawing(false);
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [isOpen, paint]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    // Export at 1080x1080
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1080;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0a15";
    ctx.fillRect(0, 0, 1080, 1080);

    const exportCell = 1080 / gridSize;
    pixels.forEach((color, key) => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * exportCell, y * exportCell, exportCell, exportCell);
    });

    const link = document.createElement("a");
    link.download = `pixelon-playground-${Date.now().toString(36)}.png`;
    link.href = exportCanvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast("Downloaded!");
    setTimeout(() => setToast(null), 2000);
  }, [pixels, gridSize]);

  const handleRandomize = useCallback(() => {
    const newPixels = new Map<string, string>();
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (Math.random() > 0.4) {
          newPixels.set(`${x},${y}`, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
        }
      }
    }
    setPixels(newPixels);
  }, [gridSize]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full group p-4 bg-gradient-to-r from-[#111122] to-[#0d0d1a] border border-[#2a2a40] hover:border-base-purple/30 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-purple/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="1.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-bold text-gray-200">Pixel Playground</h3>
            <p className="text-[10px] text-gray-500">
              Draw pixel art from scratch — export as 1080×1080 PNG
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-base-purple ml-auto group-hover:translate-x-1 transition-all">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-[#111122] to-[#0d0d1a] border border-[#2a2a40] rounded-2xl space-y-4 relative">
      {/* Toast */}
      {toast && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-base-mint/20 border border-base-mint/30 rounded-lg text-xs text-base-mint font-display animate-fade-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-base-purple/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
            Pixel Playground
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors font-display"
        >
          Close
        </button>
      </div>

      {/* Grid size selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">Grid:</span>
        {GRID_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => {
              setGridSize(size);
              setPixels(new Map());
            }}
            className={[
              "text-[10px] font-display px-2 py-1 rounded-md transition-all",
              gridSize === size
                ? "bg-base-purple text-white"
                : "text-gray-500 bg-[#1a1a2e] hover:text-gray-300",
            ].join(" ")}
          >
            {size}×{size}
          </button>
        ))}
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2">
        {(["draw", "erase", "fill"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={[
              "flex items-center gap-1 text-[10px] font-display px-2.5 py-1.5 rounded-lg transition-all",
              tool === t
                ? "bg-base-blue text-white"
                : "text-gray-500 bg-[#1a1a2e] hover:text-gray-300",
            ].join(" ")}
          >
            {t === "draw" && "✏️ Draw"}
            {t === "erase" && "🧹 Erase"}
            {t === "fill" && "🪣 Fill"}
          </button>
        ))}
      </div>

      {/* Color palette */}
      <div className="flex flex-wrap gap-1.5">
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={[
              "w-6 h-6 rounded-md border-2 transition-all hover:scale-110",
              selectedColor === color
                ? "border-white scale-110 shadow-lg"
                : "border-transparent",
            ].join(" ")}
            style={{ backgroundColor: color }}
          />
        ))}
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
          title="Custom color"
        />
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg border border-[#2a2a40] cursor-crosshair touch-none"
          style={{
            width: `${Math.min(320, canvasSize)}px`,
            height: `${Math.min(320, canvasSize)}px`,
            imageRendering: "pixelated",
          }}
          onMouseDown={(e) => {
            setIsDrawing(true);
            paint(e);
          }}
          onMouseMove={(e) => isDrawing && paint(e)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onTouchEnd={() => setIsDrawing(false)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleRandomize}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1a1a2e] text-xs text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          🎲 Random
        </button>
        <button
          onClick={() => setPixels(new Map())}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#1a1a2e] text-xs text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          🗑️ Clear
        </button>
        <button
          onClick={handleDownload}
          disabled={pixels.size === 0}
          className="flex-[2] flex items-center justify-center gap-1.5 py-2 bg-base-blue hover:bg-blue-600 text-xs text-white font-display font-bold rounded-lg transition-all disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export 1080×1080
        </button>
      </div>
    </div>
  );
}
