"use client";

import { useState } from "react";
import type { PixelateOptions } from "@/lib/pixelate";

interface PixelControlsProps {
  options: PixelateOptions;
  onChange: (options: PixelateOptions) => void;
  disabled?: boolean;
}

interface StylePreset {
  id: string;
  name: string;
  desc: string;
  color: string;
  activeColor: string;
  options: PixelateOptions;
}

const PRESETS: StylePreset[] = [
  {
    id: "retro8",
    name: "Retro 8-Bit",
    desc: "Classic NES style",
    color: "border-base-blue/20 hover:border-base-blue/40",
    activeColor: "border-base-blue bg-base-blue/10",
    options: { pixelSize: 32, colorLimit: 16, brightness: 5, contrast: 1.2 },
  },
  {
    id: "gameboy",
    name: "GameBoy",
    desc: "4-color green tint",
    color: "border-base-mint/20 hover:border-base-mint/40",
    activeColor: "border-base-mint bg-base-mint/10",
    options: { pixelSize: 24, colorLimit: 4, brightness: 10, contrast: 1.4 },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    desc: "Neon high contrast",
    color: "border-base-purple/20 hover:border-base-purple/40",
    activeColor: "border-base-purple bg-base-purple/10",
    options: { pixelSize: 8, colorLimit: 32, brightness: -10, contrast: 1.8 },
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean & simple",
    color: "border-base-accent/20 hover:border-base-accent/40",
    activeColor: "border-base-accent bg-base-accent/10",
    options: { pixelSize: 48, colorLimit: 8, brightness: 15, contrast: 0.9 },
  },
  {
    id: "hd",
    name: "HD Pixel",
    desc: "High detail pixels",
    color: "border-base-ember/20 hover:border-base-ember/40",
    activeColor: "border-base-ember bg-base-ember/10",
    options: { pixelSize: 4, colorLimit: 64, brightness: 0, contrast: 1.1 },
  },
  {
    id: "poster",
    name: "Poster",
    desc: "Bold & punchy",
    color: "border-amber-500/20 hover:border-amber-500/40",
    activeColor: "border-amber-500 bg-amber-500/10",
    options: { pixelSize: 16, colorLimit: 8, brightness: -5, contrast: 1.6 },
  },
];

const PIXEL_SIZES = [4, 8, 16, 24, 32, 48, 64];
const COLOR_LIMITS = [0, 4, 8, 16, 32, 64];

export function PixelControls({ options, onChange, disabled }: PixelControlsProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const update = (partial: Partial<PixelateOptions>) => {
    setActivePreset(null);
    onChange({ ...options, ...partial });
  };

  const applyPreset = (preset: StylePreset) => {
    setActivePreset(preset.id);
    onChange(preset.options);
  };

  return (
    <div className={["space-y-5", disabled ? "opacity-40 pointer-events-none" : ""].join(" ")}>
      {/* Preset Styles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-base-purple/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
            Style Presets
          </h3>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={[
                "p-2.5 rounded-xl border text-left transition-all duration-200 flex-shrink-0 w-[120px]",
                activePreset === preset.id
                  ? preset.activeColor
                  : ["bg-[#0d0d1a]/50", preset.color].join(" "),
              ].join(" ")}
            >
              <p className="font-display text-[11px] font-bold text-gray-200">{preset.name}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1a1a2e]" />
        <span className="text-[9px] text-gray-600 font-display uppercase tracking-wider">or customize</span>
        <div className="flex-1 h-px bg-[#1a1a2e]" />
      </div>

      {/* Manual Controls Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-base-blue/20 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="2">
            <path d="M12 20V10" />
            <path d="M18 20V4" />
            <path d="M6 20v-4" />
          </svg>
        </div>
        <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
          Manual Controls
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
              className={[
                "text-[9px] font-display w-7 h-5 rounded flex items-center justify-center transition-colors",
                options.pixelSize === s
                  ? "bg-base-blue text-white"
                  : "text-gray-600 hover:text-gray-400 hover:bg-[#1a1a2e]",
              ].join(" ")}
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
              className={[
                "flex-1 text-[10px] font-display py-1.5 rounded-lg transition-all",
                options.colorLimit === c
                  ? "bg-base-blue text-white shadow-md shadow-base-blue/30"
                  : "bg-[#1a1a2e] text-gray-500 hover:bg-[#222240] hover:text-gray-300",
              ].join(" ")}
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
        onClick={() => {
          setActivePreset(null);
          onChange({ pixelSize: 16, colorLimit: 0, brightness: 0, contrast: 1.0 });
        }}
        className="w-full text-[10px] font-display text-gray-600 hover:text-gray-400 py-1.5 rounded-lg border border-[#2a2a40] hover:border-[#3a3a55] transition-colors uppercase tracking-wider"
      >
        {"\u21BA Reset to Default"}
      </button>
    </div>
  );
}
