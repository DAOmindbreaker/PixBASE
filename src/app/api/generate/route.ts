import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate
 * Calls Replicate Flux model to generate an image from a text prompt.
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

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "Replicate API not configured" },
        { status: 500 }
      );
    }

    // Create prediction using Replicate API
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Flux Dev model — fast, high quality
        version: "black-forest-labs/flux-dev",
        input: {
          prompt: prompt.trim(),
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          num_inference_steps: 28,
          guidance: 3.5,
        },
      }),
    });

    if (!createResponse.ok) {
      const errData = await createResponse.text();
      console.error("Replicate create error:", errData);
      return NextResponse.json(
        { error: "Failed to start image generation" },
        { status: 500 }
      );
    }

    const prediction = await createResponse.json();

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // ~2 minutes

    while (
      result.status !== "succeeded" &&
      result.status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        }
      );

      if (!pollResponse.ok) break;
      result = await pollResponse.json();
    }

    if (result.status === "succeeded" && result.output) {
      // Flux returns an array of URLs or a single URL
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
      return NextResponse.json({ imageUrl, status: "success" });
    }

    return NextResponse.json(
      {
        error: result.error || "Image generation timed out. Try again.",
        status: "failed",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
