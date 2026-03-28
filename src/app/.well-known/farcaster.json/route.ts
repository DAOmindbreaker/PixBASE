import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
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
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
