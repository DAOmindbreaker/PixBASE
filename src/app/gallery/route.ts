import { NextResponse } from "next/server";

/**
 * GET /api/gallery
 * 
 * Fetch recent NFT creations directly from Base chain.
 * 
 * Strategy:
 * 1. Basescan API → get recent txs to Zora 1155 Creator on Base
 * 2. For each tx → decode the contractURI (IPFS link) from input data
 * 3. Fetch metadata JSON from IPFS gateway → get image, name, attributes
 * 
 * No Zora API needed. Pure Base chain data.
 */

export const revalidate = 120; // ISR: revalidate every 2 minutes

const BASESCAN_API = "https://api.basescan.org/api";
const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

// IPFS gateways to try (in order)
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

interface GalleryItem {
  id: string;
  name: string;
  description: string;
  creator: string;
  imageUrl: string;
  contractAddress: string;
  txHash: string;
  timestamp: string;
  blockNumber: number;
  mintInfo: {
    pixelSize?: string;
    colorPalette?: string;
    source?: string;
    generator?: string;
  };
}

/**
 * Try to extract IPFS CID from transaction input data.
 * The createContract call has contractURI as first string param (ipfs://...)
 */
function extractIPFSFromInput(input: string): string | null {
  try {
    // Look for "ipfs://" pattern in the hex-decoded input data
    // The contractURI is typically the first string argument
    const hex = input.slice(2); // remove 0x

    // Search for the ipfs:// prefix in UTF-8 decoded segments
    // "ipfs://" in hex = 697066733a2f2f
    const ipfsMarker = "697066733a2f2f";
    const markerIdx = hex.indexOf(ipfsMarker);

    if (markerIdx === -1) return null;

    // Extract CID after "ipfs://" - CIDs are typically 46 chars (CIDv0) or longer (CIDv1)
    const afterMarker = hex.slice(markerIdx + ipfsMarker.length);

    // Read until we hit a null byte (00) or non-alphanumeric hex
    let cidHex = "";
    for (let i = 0; i < afterMarker.length; i += 2) {
      const byte = parseInt(afterMarker.slice(i, i + 2), 16);
      // CID chars: alphanumeric (A-Z a-z 0-9) 
      if (
        (byte >= 48 && byte <= 57) ||  // 0-9
        (byte >= 65 && byte <= 90) ||  // A-Z
        (byte >= 97 && byte <= 122)    // a-z
      ) {
        cidHex += afterMarker.slice(i, i + 2);
      } else {
        break;
      }
    }

    if (cidHex.length < 20) return null; // Too short for a CID

    // Convert hex to string
    const cid = Buffer.from(cidHex, "hex").toString("utf-8");
    return cid.length >= 10 ? cid : null;
  } catch {
    return null;
  }
}

/**
 * Fetch metadata JSON from IPFS, trying multiple gateways.
 */
async function fetchIPFSMetadata(cid: string): Promise<any | null> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${gateway}${cid}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("json") || contentType.includes("text")) {
          const json = await res.json();
          return json;
        }
      }
    } catch {
      // Try next gateway
      continue;
    }
  }
  return null;
}

/**
 * Convert IPFS URI to HTTP URL via gateway.
 */
function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAYS[0]}${uri.slice(7)}`;
  }
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }
  // Bare CID
  return `${IPFS_GATEWAYS[0]}${uri}`;
}

export async function GET() {
  try {
    // Step 1: Fetch recent transactions to Zora 1155 Creator on Base
    const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";
    const params = new URLSearchParams({
      module: "account",
      action: "txlist",
      address: ZORA_1155_CREATOR,
      page: "1",
      offset: "24",
      sort: "desc",
      ...(apiKey && { apikey: apiKey }),
    });

    const res = await fetch(`${BASESCAN_API}?${params}`);
    const data = await res.json();

    if (data.status !== "1" || !Array.isArray(data.result)) {
      return NextResponse.json({
        items: [],
        source: "basescan",
        error: "No transactions found",
      });
    }

    // Step 2: Process transactions - filter successful ones
    const successfulTxs = data.result
      .filter((tx: any) => tx.isError === "0" && tx.input && tx.input.length > 10)
      .slice(0, 16);

    // Step 3: For each tx, try to extract IPFS CID and fetch metadata
    const items: GalleryItem[] = [];

    // Process in parallel with concurrency limit
    const metadataPromises = successfulTxs.map(async (tx: any, idx: number) => {
      const cid = extractIPFSFromInput(tx.input);
      let metadata: any = null;

      if (cid) {
        metadata = await fetchIPFSMetadata(cid);
      }

      const item: GalleryItem = {
        id: tx.hash,
        name: metadata?.name || `Base Creation #${idx + 1}`,
        description: metadata?.description || "NFT created on Base via Zora Protocol",
        creator: tx.from,
        imageUrl: metadata?.image ? ipfsToHttp(metadata.image) : "",
        contractAddress: tx.to || ZORA_1155_CREATOR,
        txHash: tx.hash,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        blockNumber: parseInt(tx.blockNumber),
        mintInfo: {},
      };

      // Extract Pixelon-specific attributes if available
      if (metadata?.attributes && Array.isArray(metadata.attributes)) {
        const getAttr = (name: string) =>
          metadata.attributes.find(
            (a: any) => a.trait_type === name
          )?.value?.toString();

        item.mintInfo = {
          pixelSize: getAttr("Pixel Size"),
          colorPalette: getAttr("Color Palette"),
          source: getAttr("Source"),
          generator: getAttr("Generator"),
        };
      }

      return item;
    });

    const results = await Promise.allSettled(metadataPromises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        items.push(result.value);
      }
    }

    // Count how many have real images
    const withImages = items.filter((i) => i.imageUrl).length;

    return NextResponse.json({
      items,
      source: "base",
      count: items.length,
      withImages,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Gallery API error:", err);
    return NextResponse.json(
      {
        items: [],
        source: "error",
        error: err instanceof Error ? err.message : "Failed to fetch",
      },
      { status: 500 }
    );
  }
}
