/**
 * Pixelon — Server-side Pixel Art Engine
 * 
 * Port dari pixelate.ts (browser) ke Node.js menggunakan node-canvas.
 * Output selalu 1080×1080 PNG.
 */

import { createCanvas, loadImage as loadCanvasImage } from "canvas";

const NFT_SIZE = 1080;

interface PixelateOptions {
  pixelSize?: number;
  colorLimit?: number;
  brightness?: number;
  contrast?: number;
}

export async function pixelateServer(
  imageBuffer: Buffer,
  options: PixelateOptions = {}
): Promise<Buffer> {
  const {
    pixelSize = 16,
    colorLimit = 0,
    brightness = 0,
    contrast = 1.0,
  } = options;

  // Load image dari buffer
  const image = await loadCanvasImage(imageBuffer);

  // Step 0: Crop & resize ke 1080×1080 (center crop)
  const w = image.width;
  const h = image.height;
  const cropSize = Math.min(w, h);
  const sx = Math.floor((w - cropSize) / 2);
  const sy = Math.floor((h - cropSize) / 2);

  const squareCanvas = createCanvas(NFT_SIZE, NFT_SIZE);
  const squareCtx = squareCanvas.getContext("2d");
  squareCtx.imageSmoothingEnabled = true;
  (squareCtx as any).imageSmoothingQuality = "high";
  squareCtx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, NFT_SIZE, NFT_SIZE);

  // Step 1: Downscale ke ukuran kecil (pixelation)
  const scaledSize = Math.max(1, Math.ceil(NFT_SIZE / pixelSize));
  const tempCanvas = createCanvas(scaledSize, scaledSize);
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(squareCanvas, 0, 0, scaledSize, scaledSize);

  // Step 2: Color reduction
  if (colorLimit > 0 && colorLimit < 256) {
    const imageData = tempCtx.getImageData(0, 0, scaledSize, scaledSize);
    const data = imageData.data;

    const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 8) * 8;
      const g = Math.round(data[i + 1] / 8) * 8;
      const b = Math.round(data[i + 2] / 8) * 8;
      const key = `${r},${g},${b}`;
      const existing = colorMap.get(key);
      if (existing) existing.count++;
      else colorMap.set(key, { r, g, b, count: 1 });
    }

    const palette = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, colorLimit)
      .map((c) => [c.r, c.g, c.b] as [number, number, number]);

    for (let i = 0; i < data.length; i += 4) {
      let minDist = Infinity;
      let nearest = palette[0];
      for (const color of palette) {
        const dr = data[i] - color[0];
        const dg = data[i + 1] - color[1];
        const db = data[i + 2] - color[2];
        const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
        if (dist < minDist) { minDist = dist; nearest = color; }
      }
      data[i] = nearest[0];
      data[i + 1] = nearest[1];
      data[i + 2] = nearest[2];
    }
    tempCtx.putImageData(imageData, 0, 0);
  }

  // Step 3: Brightness & contrast
  if (brightness !== 0 || contrast !== 1.0) {
    const imageData = tempCtx.getImageData(0, 0, scaledSize, scaledSize);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let val = data[i + c];
        val = (val - 128) * contrast + 128;
        val += brightness;
        data[i + c] = Math.max(0, Math.min(255, Math.round(val)));
      }
    }
    tempCtx.putImageData(imageData, 0, 0);
  }

  // Step 4: Upscale kembali ke 1080×1080 (pixel art effect)
  const outputCanvas = createCanvas(NFT_SIZE, NFT_SIZE);
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.imageSmoothingEnabled = false;
  outputCtx.drawImage(tempCanvas, 0, 0, scaledSize, scaledSize, 0, 0, NFT_SIZE, NFT_SIZE);

  return outputCanvas.toBuffer("image/png");
}