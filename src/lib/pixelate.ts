/**
 * PixBASE — Pixel Art Engine
 *
 * Efficient HTML5 Canvas-based pixelation with color palette reduction.
 * Uses nearest-neighbor downscale + upscale for authentic pixel art.
 * Output is always 1080×1080 (NFT standard).
 */

/** NFT output size — fixed 1080×1080 */
export const NFT_SIZE = 1080;

export interface PixelateOptions {
  /** Pixel block size (smaller = more detail). Values: 4–64 */
  pixelSize: number;
  /** Max colors in palette. 0 = no limit */
  colorLimit: number;
  /** Brightness adjustment (-50 to 50) */
  brightness: number;
  /** Contrast adjustment (0.5 to 2.0) */
  contrast: number;
}

export const DEFAULT_OPTIONS: PixelateOptions = {
  pixelSize: 16,
  colorLimit: 0,
  brightness: 0,
  contrast: 1.0,
};

/**
 * Crop and resize any image to 1080×1080 square (center crop).
 */
function cropAndResizeTo1080(
  source: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const w = source.width || (source as HTMLImageElement).naturalWidth;
  const h = source.height || (source as HTMLImageElement).naturalHeight;

  // Center crop to square
  const cropSize = Math.min(w, h);
  const sx = Math.floor((w - cropSize) / 2);
  const sy = Math.floor((h - cropSize) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = NFT_SIZE;
  canvas.height = NFT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, sx, sy, cropSize, cropSize, 0, 0, NFT_SIZE, NFT_SIZE);

  return canvas;
}

/**
 * Core pixelation function.
 * 1. Crops source image to center square
 * 2. Resizes to 1080×1080
 * 3. Pixelates with given options
 * Output canvas is always 1080×1080.
 */
export function pixelateImage(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  options: PixelateOptions = DEFAULT_OPTIONS
): void {
  const { pixelSize, colorLimit, brightness, contrast } = options;
  const ctx = outputCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const w = sourceImage.width || (sourceImage as HTMLImageElement).naturalWidth;
  const h = sourceImage.height || (sourceImage as HTMLImageElement).naturalHeight;
  if (!w || !h) return;

  // Step 0: Crop & resize to 1080×1080 square
  const squareCanvas = cropAndResizeTo1080(sourceImage);

  // Set output canvas to NFT size
  outputCanvas.width = NFT_SIZE;
  outputCanvas.height = NFT_SIZE;

  // Calculate scaled-down dimensions for pixelation
  const scaledSize = Math.max(1, Math.ceil(NFT_SIZE / pixelSize));

  // Step 1: Draw square image at tiny size (downscale)
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = scaledSize;
  tempCanvas.height = scaledSize;
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  if (!tempCtx) return;

  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(squareCanvas, 0, 0, scaledSize, scaledSize);

  // Step 2: Apply color palette reduction if needed
  if (colorLimit > 0 && colorLimit < 256) {
    applyColorReduction(tempCtx, scaledSize, scaledSize, colorLimit);
  }

  // Step 3: Apply brightness/contrast
  if (brightness !== 0 || contrast !== 1.0) {
    applyBrightnessContrast(tempCtx, scaledSize, scaledSize, brightness, contrast);
  }

  // Step 4: Draw tiny image back to 1080×1080 (upscale) — pixel effect
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, scaledSize, scaledSize, 0, 0, NFT_SIZE, NFT_SIZE);
}

/**
 * Reduce colors using frequency-based quantization.
 */
function applyColorReduction(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  maxColors: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 8) * 8;
    const g = Math.round(data[i + 1] / 8) * 8;
    const b = Math.round(data[i + 2] / 8) * 8;
    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r, g, b, count: 1 });
    }
  }

  const sortedColors = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  const palette = sortedColors.map((c) => [c.r, c.g, c.b] as [number, number, number]);

  for (let i = 0; i < data.length; i += 4) {
    const nearest = findNearestColor(data[i], data[i + 1], data[i + 2], palette);
    data[i] = nearest[0];
    data[i + 1] = nearest[1];
    data[i + 2] = nearest[2];
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Find the nearest color in palette using perceptual distance.
 */
function findNearestColor(
  r: number,
  g: number,
  b: number,
  palette: [number, number, number][]
): [number, number, number] {
  let minDist = Infinity;
  let nearest = palette[0];

  for (const color of palette) {
    const dr = r - color[0];
    const dg = g - color[1];
    const db = b - color[2];
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < minDist) {
      minDist = dist;
      nearest = color;
    }
  }

  return nearest;
}

/**
 * Apply brightness and contrast adjustments.
 */
function applyBrightnessContrast(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brightness: number,
  contrast: number
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      val = (val - 128) * contrast + 128;
      val += brightness;
      data[i + c] = Math.max(0, Math.min(255, Math.round(val)));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Load an image from a URL and return an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Convert a File to a data URL.
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Export canvas content as PNG blob.
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export canvas"));
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Download canvas as PNG file.
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = "pixbase.png"): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
