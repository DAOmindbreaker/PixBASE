"use client";

import type { PixelateOptions } from "@/lib/pixelate";

interface PixelControlsProps {
  options: PixelateOptions;
  onChange: (options: PixelateOptions) => void;
  disabled?: boolean;
}

const PIXEL_SIZES = [4, 8, 16, 24, 32, 48, 64];
const COLOR_LIMITS = [0, 4, 8, 16, 32, 64];

export function PixelControls({ options, onChange, disabled }: PixelControlsProps) {
  const update = (partial: Partial<PixelateOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className={`space-y-5 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-base-blue/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2">
            <path d="M12 20V10" />
            <path d="M18 20V4" />
            <path d="M6 20v-4" />
          </svg>
        </div>
        <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
          Pixel Controls
        </h3>
      </div>

      {/* Pixel Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Pixel Size</label>
          <span className="font-display text-xs text-base-accent font-bold">
            {options.pixelSize}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={PIXEL_SIZES.length - 1}
          step={1}
          value={PIXEL_SIZES.indexOf(options.pixelSize)}
          onChange={(e) => update({ pixelSize: PIXEL_SIZES[Number(e.target.value)] })}
          className="w-full"
        />
        <div className="flex justify-between px-0.5">
          {PIXEL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => update({ pixelSize: s })}
              className={`text-[9px] font-display w-7 h-5 rounded flex items-center justify-center
                transition-colors ${
                  options.pixelSize === s
                    ? "bg-base-blue text-white"
                    : "text-gray-600 hover:text-gray-400 hover:bg-[#1a1a2e]"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Color Palette</label>
          <span className="font-display text-xs text-base-accent font-bold">
            {options.colorLimit === 0 ? "Full" : `${options.colorLimit} colors`}
          </span>
        </div>
        <div className="flex gap-1.5">
          {COLOR_LIMITS.map((c) => (
            <button
              key={c}
              onClick={() => update({ colorLimit: c })}
              className={`flex-1 text-[10px] font-display py-1.5 rounded-lg transition-all
                ${
                  options.colorLimit === c
                    ? "bg-base-blue text-white shadow-md shadow-base-blue/30"
                    : "bg-[#1a1a2e] text-gray-500 hover:bg-[#222240] hover:text-gray-300"
                }`}
            >
              {c === 0 ? "Full" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Brightness</label>
          <span className="font-display text-xs text-gray-500">
            {options.brightness > 0 ? "+" : ""}{options.brightness}
          </span>
        </div>
        <input
          type="range"
          min={-50}
          max={50}
          step={5}
          value={options.brightness}
          onChange={(e) => update({ brightness: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Contrast</label>
          <span className="font-display text-xs text-gray-500">
            {options.contrast.toFixed(1)}x
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={Math.round(options.contrast * 100)}
          onChange={(e) => update({ contrast: Number(e.target.value) / 100 })}
          className="w-full"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={() =>
          onChange({ pixelSize: 16, colorLimit: 0, brightness: 0, contrast: 1.0 })
        }
        className="w-full text-[10px] font-display text-gray-600 hover:text-gray-400
                   py-1.5 rounded-lg border border-[#2a2a40] hover:border-[#3a3a55]
                   transition-colors uppercase tracking-wider"
      >
        ↺ Reset to Default
      </button>
    </div>
  );
}
