import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pixelon — Pixel NFT Generator on Base",
  description:
    "Transform any image into pixel art and mint it as an NFT on Base. Upload photos or generate with AI, customize the pixel style, and mint via Zora.",
  openGraph: {
    title: "Pixelon — Pixel NFT Generator",
    description: "Turn anything into pixel art NFTs on Base",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-base-dark antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
