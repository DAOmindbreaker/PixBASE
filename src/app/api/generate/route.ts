import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate
 * Calls Hugging Face Inference API (free tier) to generate an image.
 * Uses FLUX.1-schnell model — fast and free.
 */
export async function POST(req: NextRequest) {
  try {
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

    // Call Hugging Face Inference API with FLUX.1-schnell (free)
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

    // Check if model is loading (503)
    if (response.status === 503) {
      const data = await response.json();
      const waitTime = Math.ceil((data.estimated_time || 30));
      return NextResponse.json(
        { error: `AI model is warming up. Please try again in ${waitTime} seconds.` },
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

    // Response is a binary image (blob)
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ imageUrl, status: "success" });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
