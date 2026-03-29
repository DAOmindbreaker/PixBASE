# Pixelon — Pixel Art as a Service for AI Agents

## What is Pixelon?

Pixelon is a pixel art generator on Base with two interfaces:
- **Web App** (basepixelon.vercel.app) — humans upload or AI-generate images, customize pixel style, and mint as NFTs
- **Agent API** (/api/pixelate) — AI agents pay $0.01 USDC per request via x402 protocol, send any image, receive pixel art

## Why would an agent use Pixelon?

AI agents building on Base need visual assets. Pixelon provides pixel art generation as a programmable, pay-per-use service:

- **NFT Marketplace agents** — auto-generate pixel art thumbnails or collection previews
- **Social agents** — create unique pixel avatars for users on-the-fly
- **Gaming agents** — generate pixel sprites, items, or map tiles on demand
- **Creative agents** — transform photos into pixel art for minting or sharing
- **Profile picture agents** — convert selfies into pixel art PFPs

No API key needed. No subscription. Just pay and receive.

## Agent Endpoint

### POST /api/pixelate

**Payment:** $0.01 USDC per request via x402 (Base Mainnet)

**Input:** multipart/form-data

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| image | Yes | — | Image file (PNG, JPG, WebP, max 10MB) |
| pixelSize | No | 16 | Pixel block size (4-64, smaller = more detail) |
| colorLimit | No | 0 | Max colors in palette (0 = unlimited) |
| brightness | No | 0 | Brightness adjustment (-50 to 50) |
| contrast | No | 1.0 | Contrast multiplier (0.5 to 2.0) |

**Output:** image/png (1080x1080 pixel art)

## How It Works

```
1. Agent sends POST /api/pixelate (no payment)
   → Receives 402 Payment Required + USDC payment details

2. Agent pays $0.01 USDC on Base via x402 protocol
   → Facilitator verifies payment

3. Agent re-sends POST /api/pixelate + X-PAYMENT header
   → Receives pixel art PNG (1080x1080)
```

## Example Request

```bash
# Step 1: Get payment requirements
curl -X POST https://basepixelon.vercel.app/api/pixelate \
  -F "image=@photo.png"
# Returns 402 with payment details

# Step 2: After x402 payment, include payment proof
curl -X POST https://basepixelon.vercel.app/api/pixelate \
  -F "image=@photo.png" \
  -F "pixelSize=8" \
  -F "colorLimit=16" \
  -H "X-PAYMENT: <x402_payment_header>"
# Returns pixel art PNG
```

## Identity

- **Name:** Pixelon
- **Basename:** pixelon.base.eth
- **Registry:** ERC-8004 on Base Mainnet
- **Builder:** Registered on base.dev
- **Website:** https://basepixelon.vercel.app
- **Network:** Base Mainnet (Chain ID: 8453)
- **Payment:** USDC via x402 protocol

## Authentication

x402 payment required. No API key needed. No subscription.
Pay per request. Receive per request.

## Links

- Web App: https://basepixelon.vercel.app
- Agent API: https://basepixelon.vercel.app/api/pixelate
- SKILL.md: https://basepixelon.vercel.app/.well-known/SKILL.md
- ERC-8004: https://www.8004scan.io
