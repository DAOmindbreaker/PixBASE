import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { x402Server, PIXELON_PAY_TO, NETWORK, PRICES } from "@/lib/x402";

/**
 * POST /api/x402/generate
 *
 * x402 V2 protected AI image generation endpoint.
 * For AI agents that want to generate + pixelate in one step.
 * Payment: $0.005 USDC on Base via x402.
 *
 * Input: { prompt: string, pixelSize?: number, colorLimit?: number }
 * Output: { imageUrl: string (base64), metadata: {...} }
 */

const handler = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const { prompt, pixelSize = 16, colorLimit = 0 } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Prompt must be at least 3 characters" },
        { status: 400 }
      );
    }

    const hfToken = process.env.HUGGINGFACE_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Generate image via Hugging Face
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: {
            num_inference_steps: 4,
            width: 1024,
            height: 1024,
          },
        }),
      }
    );

    if (response.status === 503) {
      const data = await response.json();
      const waitTime = Math.ceil(data.estimated_time || 30);
      return NextResponse.json(
        {
          error: `AI model warming up. Retry in ${waitTime}s.`,
          retryAfter: waitTime,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      status: "success",
      imageUrl: `data:image/jpeg;base64,${base64}`,
      metadata: {
        prompt: prompt.trim(),
        pixelSize,
        colorLimit,
        model: "FLUX.1-schnell",
        size: "1024x1024",
        generator: "Pixelon",
        chain: "Base",
        protocol: "x402-v2",
      },
    });
  } catch (error) {
    console.error("x402 Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: PRICES.generate,
      network: NETWORK,
      payTo: PIXELON_PAY_TO,
      maxTimeoutSeconds: 120,
    },
    description: "Pixelon: AI-generate an image from a text prompt",
    mimeType: "application/json",
  },
  x402Server
);
