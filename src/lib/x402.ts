/**
 * Pixelon — x402 V2 Server Configuration
 *
 * Shared x402ResourceServer instance for all paid API routes.
 * Uses Coinbase Facilitator (free, production-ready for Base mainnet).
 *
 * x402 V2 changes from V1:
 * - Network format: "eip155:8453" (Base mainnet) instead of "base"
 * - Requires x402ResourceServer + ExactEvmScheme
 * - payTo is per-route, not global
 * - Facilitator URL: https://x402.org/facilitator
 */

import { x402ResourceServer } from "@x402/next";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Coinbase Facilitator — free for Base mainnet USDC
const FACILITATOR_URL = "https://x402.org/facilitator";

// Wallet address that receives payments
export const PIXELON_PAY_TO = (process.env.AGENT_WALLET_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Base mainnet chain ID in CAIP-2 format
export const BASE_MAINNET = "eip155:8453";
export const BASE_SEPOLIA = "eip155:84532";

// Use mainnet by default, sepolia for testing
export const NETWORK = process.env.X402_NETWORK === "testnet" ? BASE_SEPOLIA : BASE_MAINNET;

// Pricing
export const PRICES = {
  pixelate: "$0.01", // Pixelate an image
  generate: "$0.005", // AI generate an image
};

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

// Create and export shared resource server
// Register for all EVM chains with wildcard
export const x402Server = new x402ResourceServer(facilitatorClient).register(
  "eip155:*",
  new ExactEvmScheme()
);
