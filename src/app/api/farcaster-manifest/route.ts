import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjUzMjAzNCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDVGZkM2OTgwRkMwZDAwMzI1ODA1Q0U4OTU0RDM0MmE3N2ZGOWNmNDIifQ",
      payload: "eyJkb21haW4iOiJiYXNlcGl4ZWxvbi52ZXJjZWwuYXBwIn0",
      signature:
        "FSdkm8AeM+zV2SiJaL/dyXqopAJhsKkCwSxFmPS7E0VHJo+c4+ja4nEiQ0zjTBNR4vCoIuFdQRyoCTl4/IhN7Rw=",
    },
    frame: {
      version: "1",
      name: "Pixelon",
      iconUrl: "https://basepixelon.vercel.app/icon.png",
      homeUrl: "https://basepixelon.vercel.app",
      splashImageUrl: "https://basepixelon.vercel.app/splash.png",
      splashBackgroundColor: "#0A0A1A",
      subtitle: "Pixel Art NFTs on Base",
      description:
        "Transform any image into pixel art and mint as NFT on Base. Upload a photo or generate with AI, customize the pixel style, then mint via Zora with low gas fees.",
      primaryCategory: "developer-tools",
      tags: ["pixel-art", "nft", "base", "zora", "ai", "creative"],
      enabled: true,
    },
  });
}