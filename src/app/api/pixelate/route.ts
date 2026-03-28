import { NextRequest, NextResponse } from "next/server";
import { pixelateServer } from "@/lib/pixelateServer";

export async function POST(request: NextRequest) {
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
}