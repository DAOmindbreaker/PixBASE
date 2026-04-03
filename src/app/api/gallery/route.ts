import { NextResponse } from "next/server";

export const revalidate = 120;

const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `${IPFS_GATEWAYS[0]}${uri.slice(7)}`;
  if (uri.startsWith("https://") || uri.startsWith("http://")) return uri;
  return `${IPFS_GATEWAYS[0]}${uri}`;
}

export async function GET() {
  try {
    // Zora GraphQL - recent mints on Base, no collection filter
    const query = `{
      tokens(
        networks: [{network: BASE, chain: BASE_MAINNET}]
        pagination: {limit: 16}
        sort: {sortKey: CREATED, sortDirection: DESC}
      ) {
        nodes {
          token {
            tokenId
            name
            description
            image { url }
            mintInfo { mintContext { transactionHash blockTimestamp } }
            owner
            tokenContract { collectionAddress }
          }
        }
      }
    }`;

    const res = await fetch("https://api.zora.co/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    // Log error if any
    if (data.errors) {
      console.error("Zora API errors:", JSON.stringify(data.errors));
      return NextResponse.json({ items: [], source: "zora", error: data.errors[0]?.message });
    }

    const nodes = data?.data?.tokens?.nodes || [];

    if (!nodes.length) {
      return NextResponse.json({ items: [], source: "zora", error: "No tokens found" });
    }

    const items = nodes.map((node: any, idx: number) => {
      const t = node.token;
      const imageUrl = t.image?.url ? ipfsToHttp(t.image.url) : "";
      return {
        id: t.mintInfo?.mintContext?.transactionHash || `token-${idx}`,
        name: t.name || `Base Creation #${idx + 1}`,
        description: t.description || "NFT on Base via Zora",
        creator: t.owner || "",
        imageUrl,
        contractAddress: t.tokenContract?.collectionAddress || "",
        txHash: t.mintInfo?.mintContext?.transactionHash || "",
        timestamp: t.mintInfo?.mintContext?.blockTimestamp || new Date().toISOString(),
        blockNumber: 0,
        mintInfo: {},
      };
    });

    return NextResponse.json({
      items,
      source: "zora",
      count: items.length,
      withImages: items.filter((i: any) => i.imageUrl).length,
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