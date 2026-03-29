"use client";

import { Attribution } from "ox/erc8021";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  uploadToIPFS,
  uploadMetadataToIPFS,
  buildMetadata,
  getBasescanURL,
  ZORA_1155_CREATOR_ADDRESS,
  ZORA_CREATOR_ABI,
  type MintProgress,
} from "@/lib/zoraMint";
import { canvasToBlob } from "@/lib/pixelate";

interface MintButtonProps {
  canvas: HTMLCanvasElement | null;
  pixelSize: number;
  colorLimit: number;
  mode: "upload" | "ai";
  prompt?: string;
  onMintComplete?: () => void;
}

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_z8mrhec8"],
});

export function MintButton({
  canvas,
  pixelSize,
  colorLimit,
  mode,
  prompt,
  onMintComplete,
}: MintButtonProps) {
  const { address, isConnected } = useAccount();
  const [progress, setProgress] = useState<MintProgress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const {
    writeContract,
    data: txHash,
    isPending: isMinting,
    isError: isTxError,
    error: txError,
    reset: resetTx,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT || "";

  // --- state transitions in useEffect (NOT in render body) ---

  useEffect(() => {
    if (txHash && progress?.step === "minting") {
      setProgress({ step: "confirming", message: "Waiting for confirmation\u2026", txHash });
    }
  }, [txHash, progress?.step]);

  useEffect(() => {
    if (isConfirmed && progress?.step === "confirming") {
      setProgress({ step: "done", message: "NFT minted successfully!", txHash });
    }
  }, [isConfirmed, progress?.step, txHash]);

  useEffect(() => {
    if (
      isTxError &&
      progress !== null &&
      progress.step !== "done" &&
      progress.step !== "error"
    ) {
      const raw = txError?.message ?? "Transaction failed";
      const cancelled =
        raw.includes("User rejected") ||
        raw.includes("user rejected") ||
        raw.includes("User denied") ||
        raw.includes("ACTION_REJECTED");

      setProgress({
        step: "error",
        message: cancelled ? "Transaction cancelled by user" : raw.slice(0, 120),
      });
    }
  }, [isTxError, txError, progress]);

  // --- handlers ---

  const handleMint = async () => {
    if (!canvas || !address || !pinataJwt) return;

    try {
      setProgress({ step: "uploading_image", message: "Uploading pixel art to IPFS\u2026" });
      const imageBlob = await canvasToBlob(canvas);
      const imageCID = await uploadToIPFS(imageBlob, pinataJwt);

      setProgress({ step: "uploading_metadata", message: "Uploading NFT metadata\u2026" });
      const metadata = buildMetadata({
        name: name || "Pixelon Creation",
        description: description || "Pixel art created with Pixelon on Base",
        imageCID,
        pixelSize,
        colorLimit,
        mode,
        prompt,
      });
      const metadataCID = await uploadMetadataToIPFS(metadata, pinataJwt);

      setProgress({ step: "minting", message: "Confirm in your wallet\u2026" });

      writeContract({
        address: ZORA_1155_CREATOR_ADDRESS,
        abi: ZORA_CREATOR_ABI,
        functionName: "createContract",
        dataSuffix: DATA_SUFFIX,
        args: [
          `ipfs://${metadataCID}`,
          name || "Pixelon Creation",
          {
            royaltyMintSchedule: 0,
            royaltyBPS: 500,
            royaltyRecipient: address,
          },
          address,
          [],
        ],
      });
    } catch (err) {
      console.error("Mint error:", err);
      setProgress({
        step: "error",
        message: err instanceof Error ? err.message : "Minting failed",
      });
    }
  };

  const handleReset = useCallback(() => {
    const wasDone = progress?.step === "done";
    setProgress(null);
    setShowForm(false);
    setName("");
    setDescription("");
    resetTx();
    if (wasDone && onMintComplete) {
      onMintComplete();
    }
  }, [resetTx, onMintComplete, progress?.step]);

  // --- early returns ---

  if (!isConnected) {
    return (
      <div className="p-4 bg-[#111122] border border-[#2a2a40] rounded-xl text-center">
        <p className="text-sm text-gray-400">Connect wallet to mint</p>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="p-4 bg-[#111122] border border-[#2a2a40] rounded-xl text-center">
        <p className="text-sm text-gray-500">Create pixel art first to mint</p>
      </div>
    );
  }

  // --- derive step state for progress UI ---

  const allSteps: MintProgress["step"][] = [
    "uploading_image",
    "uploading_metadata",
    "minting",
    "confirming",
    "done",
  ];
  const currentIdx = progress ? allSteps.indexOf(progress.step) : -1;
  const isError = progress?.step === "error";

  // --- render ---

  return (
    <div className="space-y-4">
      <div className="p-5 bg-gradient-to-br from-[#111122] to-[#0d0d1a] border border-[#2a2a40] rounded-2xl space-y-4">
        {/* header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-blue/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052FF" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-gray-200">Mint as NFT</h3>
            <p className="text-[10px] text-gray-500">ERC-1155 on Base via Zora</p>
          </div>
        </div>

        {/* mint button */}
        {!showForm && !progress && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-base-blue/20 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Mint to Base
          </button>
        )}

        {/* metadata form */}
        {showForm && !progress && (
          <div className="space-y-3 animate-fade-up">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Pixel Creation"
                maxLength={100}
                className="w-full px-3 py-2 bg-[#0a0a15] border border-[#2a2a40] rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-base-blue/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A beautiful pixel art piece..."
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 bg-[#0a0a15] border border-[#2a2a40] rounded-lg text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-base-blue/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 text-sm text-gray-500 hover:text-gray-300 bg-[#0a0a15] rounded-xl border border-[#2a2a40] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMint}
                disabled={isMinting || isConfirming}
                className="flex-[2] py-2.5 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(isMinting || isConfirming) && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                Confirm Mint
              </button>
            </div>

            {!pinataJwt && (
              <p className="text-[10px] text-amber-400/80">
                {"⚠ PINATA_JWT not set. Configure in .env.local"}
              </p>
            )}
          </div>
        )}

        {/* progress steps */}
        {progress && (
          <div className="space-y-3 animate-fade-up">
            <div className="flex items-center gap-2">
              {allSteps.map((step, i) => {
                const isDone = i < currentIdx || progress.step === "done";
                const isCurrent = i === currentIdx;
                return (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                        isError
                          ? "bg-red-500/20 text-red-400"
                          : isDone
                          ? "bg-base-mint/20 text-base-mint"
                          : isCurrent
                          ? "bg-base-blue/20 text-base-blue animate-pulse"
                          : "bg-[#1a1a2e] text-gray-600",
                      ].join(" ")}
                    >
                      {isDone ? "\u2713" : isError ? "\u2715" : i + 1}
                    </div>
                    {i < 4 && (
                      <div
                        className={[
                          "flex-1 h-px",
                          isDone ? "bg-base-mint/30" : "bg-[#2a2a40]",
                        ].join(" ")}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className={[
                "p-3 rounded-lg text-sm",
                progress.step === "error"
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : progress.step === "done"
                  ? "bg-base-mint/10 border border-base-mint/20 text-base-mint"
                  : "bg-base-blue/5 border border-base-blue/10 text-gray-300",
              ].join(" ")}
            >
              {progress.step === "done" ? "\uD83C\uDF89 " : ""}
              {progress.message}
            </div>

            {progress.txHash && (
              <div className="flex gap-2">
                <a
                  href={getBasescanURL(progress.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs py-2 bg-[#0a0a15] border border-[#2a2a40] rounded-lg text-base-accent hover:text-white transition-colors"
                >
                  {"View on Basescan \u2197"}
                </a>
                <a
                  href="https://zora.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs py-2 bg-[#0a0a15] border border-[#2a2a40] rounded-lg text-base-accent hover:text-white transition-colors"
                >
                  {"View on Zora \u2197"}
                </a>
              </div>
            )}

            {(progress.step === "done" || progress.step === "error") && (
              <button
                onClick={handleReset}
                className="w-full text-xs text-gray-500 hover:text-gray-300 py-2 transition-colors"
              >
                {progress.step === "done" ? "Create another" : "Try again"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
