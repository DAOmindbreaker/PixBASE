# PixBASE — Pixel NFT Generator (Base Mini App)

A Base Mini App that transforms any image or AI-generated artwork into stunning pixel art, then lets you mint it as an NFT on Base via Zora.

## Features
- 🎨 Upload any image → instant pixel art conversion
- 🤖 AI Prompt → generate image via Replicate Flux → pixelate
- 🎛️ Real-time controls: pixel size, color palette, dithering
- 🖼️ Side-by-side preview (original vs pixel art)
- ⛓️ Mint as NFT on Base via Zora (gas efficient)
- 📥 Download PNG + Share
- 👛 Wallet connection with Base Mainnet detection

## Tech Stack
- Next.js 16 + TypeScript + Tailwind CSS + App Router
- Wagmi + Viem + OnchainKit (wallet connection)
- HTML5 Canvas (pixel art engine)
- Replicate API (AI image generation)
- Zora Protocol SDK (NFT minting)
- nft.storage (IPFS upload)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in your API keys

# Run dev server
npm run dev
```

## Environment Variables
See `.env.example` for required keys.

## Deploying to Vercel
```bash
npx vercel
```

## Registering as Base Mini App
1. Deploy to Vercel
2. Go to https://www.base.dev
3. Register your app with the deployed URL
4. Add your app metadata (name, icon, description)
5. Submit for review
