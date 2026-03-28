import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { pixelateServer } from "@/lib/pixelateServer";

const agentWalletAddress = process.env.AGENT_WALLET_ADDRESS as `0x${string}`;

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
        { error: "Parameter 'image' (file) wajib disertakan" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pixelatedImage = await pixelateServer(buffer, {
      pixelSize,
      colorLimit,
      brightness,
      contrast,
    });

    return new NextResponse(new Uint8Array(pixelatedImage), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": pixelatedImage.length.toString(),
        "X-Pixelon-Agent": "true",
      },
    });
  } catch (error) {
    console.error("Pixelate API error:", error);
    return NextResponse.json(
      { error: "Gagal memproses gambar" },
      { status: 500 }
    );
  }
};

export const POST = withX402(
  handler,
  agentWalletAddress,
  {
    price: "$0.01",
    network: "base-sepolia",
    config: {
      description: "Pixelon pixel art generator",
      mimeType: "image/png",
      maxTimeoutSeconds: 60,
    },
  }
);