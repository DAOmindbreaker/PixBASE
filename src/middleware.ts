import { paymentMiddleware } from "x402-next";

const agentWalletAddress = process.env.AGENT_WALLET_ADDRESS as `0x${string}`;

export const middleware = paymentMiddleware(
  agentWalletAddress,
  {
    "/api/pixelate": {
      price: "$0.01",
      network: "base",
      config: {
        description: "Pixelon pixel art generator",
        mimeType: "image/png",
        maxTimeoutSeconds: 60,
      },
    },
  }
);

export const config = {
  matcher: ["/api/pixelate"],
};