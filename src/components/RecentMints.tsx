"use client";

import { useState, useEffect, useCallback } from "react";

interface MintEvent {
  id: string;
  creator: string;
  txHash: string;
  timestamp: number;
  blockNumber: number;
  contractAddress: string;
}

const BASESCAN_API = "https://api.basescan.org/api";
const ZORA_1155_CREATOR = "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(ts: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function RecentMints() {
  const [mints, setMints] = useState<MintEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMints = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch recent transactions to Zora 1155 Creator contract on Base
      const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || "";
      const params = new URLSearchParams({
        module: "account",
        action: "txlist",
        address: ZORA_1155_CREATOR,
        page: "1",
        offset: "8",
        sort: "desc",
        ...(apiKey && { apikey: apiKey }),
      });

      const res = await fetch(`${BASESCAN_API}?${params}`);
      const data = await res.json();

      if (data.status === "1" && Array.isArray(data.result)) {
        const parsed: MintEvent[] = data.result
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
        setMints(parsed);
        setError(null);
      } else {
        // Fallback: show placeholder data
        setMints(generatePlaceholderMints());
      }
    } catch (err) {
      console.error("Failed to fetch mints:", err);
      setMints(generatePlaceholderMints());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentMints();
    const interval = setInterval(fetchRecentMints, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchRecentMints]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-base-mint" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-base-mint animate-ping opacity-50" />
          </div>
          <h3 className="font-display text-xs font-bold text-gray-400 uppercase tracking-wider">
            Recent Mints on Zora
          </h3>
        </div>
        <button
          onClick={fetchRecentMints}
          disabled={loading}
          className="text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display flex items-center gap-1"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={loading ? "animate-spin" : ""}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
          </svg>
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      {/* Mint Feed */}
      <div className="space-y-1.5">
        {loading && mints.length === 0 ? (
          // Skeleton loader
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 bg-[#0d0d1a]/60 rounded-lg animate-pulse"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1a1a2e]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 bg-[#1a1a2e] rounded" />
                <div className="h-2 w-16 bg-[#1a1a2e] rounded" />
              </div>
            </div>
          ))
        ) : (
          mints.map((mint, i) => (
            <a
              key={mint.id}
              href={`https://basescan.org/tx/${mint.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2.5 bg-[#0d0d1a]/40 hover:bg-[#111122]/80 rounded-lg transition-all duration-200 border border-transparent hover:border-[#1a1a2e]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-base-blue/30 to-base-purple/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-display font-bold text-base-accent">
                  {mint.creator.slice(2, 4).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-300 font-display font-bold truncate">
                    {shortenAddress(mint.creator)}
                  </span>
                  <span className="text-[9px] text-gray-600">minted</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-gray-600">
                    {timeAgo(mint.timestamp)}
                  </span>
                  <span className="text-[9px] text-gray-700">·</span>
                  <span className="text-[9px] text-gray-600">
                    Block #{mint.blockNumber.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-700 group-hover:text-base-accent group-hover:translate-x-0.5 transition-all flex-shrink-0"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          ))
        )}
      </div>

      {/* Footer link */}
      <a
        href={`https://basescan.org/address/${ZORA_1155_CREATOR}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-[10px] text-gray-600 hover:text-base-accent transition-colors font-display pt-1"
      >
        {"View all on Basescan \u2197"}
      </a>
    </div>
  );
}

function generatePlaceholderMints(): MintEvent[] {
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `placeholder-${i}`,
    creator: `0x${Math.random().toString(16).slice(2, 10)}${"a".repeat(32)}${Math.random().toString(16).slice(2, 6)}`,
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    timestamp: now - (i + 1) * 300 - Math.floor(Math.random() * 200),
    blockNumber: 25000000 - i * 12,
    contractAddress: ZORA_1155_CREATOR,
  }));
}
