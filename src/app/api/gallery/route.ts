import { NextResponse } from "next/server";

export const revalidate = 120;

const ALCHEMY_API = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

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

function extractIPFSFromInput(input: string): string | null {
  try {
    const hex = input.slice(2);
    const ipfsMarker = "697066733a2f2f";
    const markerIdx = hex.indexOf(ipfsMarker);
    if (markerIdx === -1) return null;
    const afterMarker = hex.slice(markerIdx + ipfsMarker.length);
    let cidHex = "";
    for (let i = 0; i < afterMarker.length; i += 2) {
      const byte = parseInt(afterMarker.slice(i, i + 2), 16);
      if (
        (byte >= 48 && byte <= 57) ||
        (byte >= 65 && byte <= 90) ||
        (byte >= 97 && byte <= 122)
      ) {
        cidHex += afterMarker.slice(i, i + 2);
      } else {
        break;
      }
    }
    if (cidHex.length < 20) return null;
    const cid = Buffer.from(cidHex, "hex").toString("utf-8");
    return cid.length >= 10 ? cid : null;
  } catch {
    return null;
  }
}

async function fetchIPFSMetadata(cid: string): Promise<any | null> {
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${gateway}${cid}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("json") || contentType.includes("text")) {
          return await res.json();
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `${IPFS_GATEWAYS[0]}${uri.slice(7)}`;
  if (uri.startsWith("https://") || uri.startsWith("http://")) return uri;
  return `${IPFS_GATEWAYS[0]}${uri}`;
}

async function alchemyPost(method: string, params: any[]) {
  const res = await fetch(ALCHEMY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return res.json();
}

export async function GET() {
  try {
    // Step 1: Get recent transfers to Zora 1155 Creator
    const transferData = await alchemyPost("alchemy_getAssetTransfers", [{
      toAddress: ZORA_1155_CREATOR,
      category: ["external"],
      maxCount: "0x10",
      order: "desc",
      withMetadata: true,
    }]);

    if (!transferData.result?.transfers?.length) {
      return NextResponse.json({ items: [], source: "alchemy", error: "No transactions found" });
    }

    const transfers = transferData.result.transfers
      .filter((tx: any) => tx.hash)
      .slice(0, 16);

    // Step 2: Fetch full tx data to get input (for IPFS extraction)
    const fullTxs = await Promise.all(
      transfers.map(async (tx: any) => {
        try {
          const txData = await alchemyPost("eth_getTransactionByHash", [tx.hash]);
          return {
            hash: tx.hash,
            from: tx.from,
            input: txData.result?.input || "",
            timeStamp: tx.metadata?.blockTimestamp
              ? String(Math.floor(new Date(tx.metadata.blockTimestamp).getTime() / 1000))
              : String(Math.floor(Date.now() / 1000)),
            blockNumber: parseInt(tx.blockNum, 16),
            to: ZORA_1155_CREATOR,
          };
        } catch {
          return {
            hash: tx.hash,
            from: tx.from,
            input: "",
            timeStamp: String(Math.floor(Date.now() / 1000)),
            blockNumber: 0,
            to: ZORA_1155_CREATOR,
          };
        }
      })
    );

    // Step 3: Extract IPFS metadata for each tx
    const items: GalleryItem[] = [];

    const metadataPromises = fullTxs.map(async (tx: any, idx: number) => {
      const cid = extractIPFSFromInput(tx.input);
      let metadata: any = null;
      if (cid) metadata = await fetchIPFSMetadata(cid);

      const item: GalleryItem = {
        id: tx.hash,
        name: metadata?.name || `Base Creation #${idx + 1}`,
        description: metadata?.description || "NFT created on Base via Zora Protocol",
        creator: tx.from,
        imageUrl: metadata?.image ? ipfsToHttp(metadata.image) : "",
        contractAddress: tx.to || ZORA_1155_CREATOR,
        txHash: tx.hash,
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        blockNumber: tx.blockNumber,
        mintInfo: {},
      };

      if (metadata?.attributes && Array.isArray(metadata.attributes)) {
        const getAttr = (name: string) =>
          metadata.attributes.find((a: any) => a.trait_type === name)?.value?.toString();
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
      if (result.status === "fulfilled") items.push(result.value);
    }

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
      { items: [], source: "error", error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}