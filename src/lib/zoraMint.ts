/**
 * Pixelon — Zora NFT Minting Logic
 *
 * Uses Zora Protocol SDK to mint ERC-721 tokens on Base.
 * Handles IPFS upload + on-chain mint in one flow.
 */

import { type Address, type Hash } from "viem";

// ============================================
// Types
// ============================================

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI (ipfs://...)
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface MintResult {
  success: boolean;
  txHash?: Hash;
  tokenId?: string;
  contractAddress?: Address;
  error?: string;
}

export interface MintProgress {
  step: "uploading_image" | "uploading_metadata" | "minting" | "confirming" | "done" | "error";
  message: string;
  txHash?: Hash;
}

// ============================================
// IPFS Upload (nft.storage)
// ============================================

/**
 * Upload a blob (image) to IPFS via nft.storage.
 * Returns the IPFS CID.
 */
export async function uploadToIPFS(
  blob: Blob,
  apiToken: string
): Promise<string> {
  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": blob.type || "image/png",
    },
    body: blob,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`IPFS upload failed: ${errText}`);
  }

  const data = await response.json();
  return data.value.cid;
}

/**
 * Upload JSON metadata to IPFS.
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata,
  apiToken: string
): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });
  return uploadToIPFS(blob, apiToken);
}

// ============================================
// Zora Mint (via direct contract call)
// ============================================

/**
 * Create a Zora ERC-721 drop and mint.
 *
 * For the Base Mini App, we use Zora's 1155 contract
 * for gas-efficient minting. This creates a new token
 * under Zora's shared contract.
 *
 * In production, you would use @zoralabs/protocol-sdk:
 *
 * ```ts
 * import { createCreatorClient } from "@zoralabs/protocol-sdk";
 * import { zora } from "viem/chains";
 *
 * const creatorClient = createCreatorClient({ chainId: base.id, publicClient });
 * const { parameters } = await creatorClient.create1155({
 *   contract: { name: "Pixelon Collection", uri: contractMetadataURI },
 *   token: {
 *     tokenMetadataURI: `ipfs://${metadataCID}`,
 *     createReferral: REFERRAL_ADDRESS,
 *   },
 *   account: userAddress,
 * });
 *
 * const txHash = await walletClient.writeContract(parameters);
 * ```
 */

// Zora 1155 Creator on Base Mainnet
export const ZORA_1155_CREATOR_ADDRESS: Address =
  "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

// Minimal ABI for Zora 1155 creation
export const ZORA_CREATOR_ABI = [
  {
    name: "createContract",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contractURI", type: "string" },
      { name: "name", type: "string" },
      { name: "defaultRoyaltyConfiguration", type: "tuple", components: [
        { name: "royaltyMintSchedule", type: "uint32" },
        { name: "royaltyBPS", type: "uint32" },
        { name: "royaltyRecipient", type: "address" },
      ]},
      { name: "defaultAdmin", type: "address" },
      { name: "setupActions", type: "bytes[]" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

/**
 * Build NFT metadata from pixel art parameters.
 */
export function buildMetadata(params: {
  name: string;
  description: string;
  imageCID: string;
  pixelSize: number;
  colorLimit: number;
  mode: "upload" | "ai";
  prompt?: string;
}): NFTMetadata {
  const attributes = [
    { trait_type: "Pixel Size", value: params.pixelSize },
    { trait_type: "Color Palette", value: params.colorLimit || "Full" },
    { trait_type: "Source", value: params.mode === "ai" ? "AI Generated" : "Uploaded" },
    { trait_type: "Generator", value: "Pixelon" },
    { trait_type: "Chain", value: "Base" },
  ];

  if (params.prompt) {
    attributes.push({ trait_type: "Prompt", value: params.prompt });
  }

  return {
    name: params.name || "Pixelon Creation",
    description:
      params.description ||
      `Pixel art created with Pixelon on Base. Pixel size: ${params.pixelSize}px.`,
    image: `ipfs://${params.imageCID}`,
    attributes: attributes as NFTMetadata["attributes"],
    external_url: "https://pixelon.base.dev",
  };
}

/**
 * Get Basescan URL for a transaction.
 */
export function getBasescanURL(txHash: Hash): string {
  return `https://basescan.org/tx/${txHash}`;
}

/**
 * Get Zora URL for a contract/token.
 */
export function getZoraURL(contractAddress: Address, tokenId?: string): string {
  const base = `https://zora.co/collect/base:${contractAddress}`;
  return tokenId ? `${base}/${tokenId}` : base;
}
