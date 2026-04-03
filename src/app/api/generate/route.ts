import { NextRequest, NextResponse } from "next/server";
import { checkServerRateLimit, recordServerGeneration } from "@/lib/rateLimit";

/**
 * POST /api/generate
 *
 * Free AI image generation with server-side rate limiting.
 * 5 free generations per day per IP address.
 * After limit: returns 429 with info to use /api/x402/generate (paid).
 */
export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check server-side rate limit
    const rateLimit = checkServerRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Daily free limit reached",
          remaining: 0,
          total: rateLimit.total,
          upgrade: {
            message:
              "Use /api/x402/generate for unlimited AI generation via x402 micropayment ($0.005 USDC)",
            endpoint: "/api/x402/generate",
            price: "$0.005",
            protocol: "x402-v2",
            network: "Base (eip155:8453)",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.total),
            "X-RateLimit-Remaining": "0",
            "Retry-After": "86400",
          },
        }
      );
    }

    const { prompt } = await req.json();

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

    // Call Hugging Face Inference API
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
          error: `AI model is warming up. Please try again in ${waitTime} seconds.`,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace error:", errText);
      return NextResponse.json(
        { error: "Image generation failed. Try again." },
        { status: 500 }
      );
    }

    // Record successful generation
    recordServerGeneration(ip);
    const updatedLimit = checkServerRateLimit(ip);

    // Response
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json(
      { imageUrl, status: "success", remaining: updatedLimit.remaining },
      {
        headers: {
          "X-RateLimit-Limit": String(updatedLimit.total),
          "X-RateLimit-Remaining": String(updatedLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
