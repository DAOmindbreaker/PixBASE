"use client";

import { useCallback, useState, useRef } from "react";
import { fileToDataURL } from "@/lib/pixelate";

interface UploadSectionProps {
  onImageLoaded: (dataUrl: string) => void;
  onImageRemoved?: () => void;
  disabled?: boolean;
}

export function UploadSection({ onImageLoaded, onImageRemoved, disabled }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, GIF, WebP)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be under 10 MB");
        return;
      }

      const dataUrl = await fileToDataURL(file);
      setPreview(dataUrl);
      onImageLoaded(dataUrl);
    },
    [onImageLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4
          min-h-[200px] rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-300
          ${isDragOver
            ? "border-base-blue bg-base-blue/5 scale-[1.01]"
            : "border-[#2a2a40] hover:border-[#3a3a55] bg-[#0d0d1a]/50 hover:bg-[#111122]/50"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {preview ? (
          <div className="relative w-full flex items-center justify-center p-4">
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-h-[160px] rounded-lg object-contain"
            />
            <div className="absolute bottom-2 right-2">
              <span className="text-xs bg-base-mint/20 text-base-mint px-2 py-1 rounded font-display">
                ✓ Loaded
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">
                Drop image here or <span className="text-base-blue">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP · Max 10 MB</p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
            onImageRemoved?.();
          }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          ✕ Remove image
        </button>
      )}
    </div>
  );
}
