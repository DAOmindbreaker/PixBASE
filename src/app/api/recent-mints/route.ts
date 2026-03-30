import { NextResponse } from "next/server";

/**
 * GET /api/recent-mints
 * Fetch recent transactions to Zora 1155 Creator on Base via Basescan.
 * Server-side to avoid CORS issues from client.
 */

const BASESCAN_API = "https://api.basescan.org/api";
const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

export const revalidate = 30; // ISR: revalidate every 30 seconds

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";
    const params = new URLSearchParams({
      module: "account",
      action: "txlist",
      address: ZORA_1155_CREATOR,
      page: "1",
      offset: "10",
      sort: "desc",
      ...(apiKey && { apikey: apiKey }),
    });

    const res = await fetch(`${BASESCAN_API}?${params}`);
    const data = await res.json();

    if (data.status === "1" && Array.isArray(data.result)) {
      const mints = data.result
        .filter((tx: any) => tx.isError === "0")
        .slice(0, 6)
        .map((tx: any) => ({
          id: tx.hash,
          creator: tx.from,
          txHash: tx.hash,
          timestamp: parseInt(tx.timeStamp),
          blockNumber: parseInt(tx.blockNumber),
          contractAddress: tx.to,
        }));

      return NextResponse.json({ mints, source: "basescan" });
    }

    return NextResponse.json({ mints: [], source: "empty" });
  } catch (err) {
    console.error("Recent mints API error:", err);
    return NextResponse.json(
      { mints: [], source: "error", error: String(err) },
      { status: 500 }
    );
  }
}
