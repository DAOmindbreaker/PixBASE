"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { TARGET_CHAIN_ID } from "@/config/wagmi";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN_ID;
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-base-blue hover:bg-blue-600
                     text-white font-display text-sm font-bold rounded-lg
                     transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                     shadow-lg shadow-base-blue/20 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M16 14h.01" />
            <path d="M2 10h20" />
          </svg>
          {isPending ? "Connecting…" : "Connect"}
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#111122] border border-[#2a2a40]
                            rounded-xl shadow-2xl overflow-hidden animate-fade-up">
              <div className="p-3 border-b border-[#2a2a40]">
                <p className="text-xs text-gray-400 font-display uppercase tracking-wider">Choose Wallet</p>
              </div>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-200
                             hover:bg-base-blue/10 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-base-accent">
                    {connector.name === "Coinbase Wallet" ? "🔵" : "🔗"}
                  </div>
                  <div>
                    <p className="font-medium">{connector.name}</p>
                    <p className="text-xs text-gray-500">
                      {connector.name === "Coinbase Wallet" ? "Smart Wallet" : "Browser"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500
                   text-white font-display text-sm font-bold rounded-lg transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Switch to Base
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111122] border border-[#2a2a40]
                      rounded-lg text-sm">
        <div className="w-2 h-2 rounded-full bg-base-mint animate-pulse" />
        <span className="font-display text-gray-300">{shortAddress}</span>
        <span className="text-xs text-gray-500 hidden sm:inline">Base</span>
      </div>
      <button
        onClick={() => disconnect()}
        className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg
                   hover:bg-red-400/10"
        title="Disconnect"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
