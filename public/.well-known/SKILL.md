# Pixelon — Pixel Art Generator Agent

## Description
Pixelon converts any image into pixel art style (1080x1080).
Built on Base. Payment via x402 protocol (USDC).

## Endpoints

### POST /api/pixelate
- **Description:** Upload an image, receive pixel art version
- **Payment:** $0.01 per request via x402 (Base, USDC)
- **Input:** multipart/form-data with fields:
  - `image` (required): Image file (PNG, JPG, WebP)
  - `pixelSize` (optional): Pixel block size, default 16
  - `colorLimit` (optional): Max colors, default 0 (unlimited)
  - `brightness` (optional): -50 to 50, default 0
  - `contrast` (optional): 0.5 to 2.0, default 1.0
- **Output:** image/png (1080x1080 pixel art)

## Authentication
x402 payment required. No API key needed.

## Network
Base Mainnet (Chain ID: 8453)

## Agent Info
- Name: Pixelon
- Website: https://basepixelon.vercel.app