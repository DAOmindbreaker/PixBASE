import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { pixelateServer } from "@/lib/pixelateServer";
import { x402Server, PIXELON_PAY_TO, NETWORK, PRICES } from "@/lib/x402";

/**
 * POST /api/pixelate
 *
 * x402 V2 protected endpoint for AI agents.
 * Accepts an image + parameters, returns pixelated 1080x1080 PNG.
 * Payment: $0.01 USDC on Base via x402.
 *
 * For human users: use the free client-side pixelation engine.
 * For AI agents: pay via x402 and get server-processed pixel art.
 */

const handler = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const pixelSize = parseInt(formData.get("pixelSize") as string) || 16;
    const colorLimit = parseInt(formData.get("colorLimit") as string) || 0;
    const brightness = parseInt(formData.get("brightness") as string) || 0;
    const contrast = parseFloat(formData.get("contrast") as string) || 1.0;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Parameter 'image' (file) is required" },
        { status: 400 }
      );
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 10 MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pixelatedImage = await pixelateServer(buffer, {
      pixelSize: Math.max(4, Math.min(64, pixelSize)),
      colorLimit: Math.max(0, Math.min(256, colorLimit)),
      brightness: Math.max(-50, Math.min(50, brightness)),
      contrast: Math.max(0.5, Math.min(2.0, contrast)),
    });

    return new NextResponse(new Uint8Array(pixelatedImage), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixelatedImage.length.toString(),
        "X-Pixelon-Agent": "true",
        "X-Pixelon-Size": "1080x1080",
        "X-Pixelon-PixelSize": String(pixelSize),
        "X-Pixelon-ColorLimit": String(colorLimit),
      },
    });
  } catch (error) {
    console.error("Pixelate API error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
};

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: PRICES.pixelate,
      network: NETWORK,
      payTo: PIXELON_PAY_TO,
      maxTimeoutSeconds: 60,
    },
    description: "Pixelon: Convert any image to 1080x1080 pixel art",
    mimeType: "image/png",
  },
  x402Server
);
