"use client";

interface PaywallProps {
  remaining: number;
  total: number;
  onClose: () => void;
}

export function Paywall({ remaining, total, onClose }: PaywallProps) {
  return (
    <div className="p-5 bg-gradient-to-br from-[#111122] to-[#0d0d1a] border border-base-blue/20 rounded-2xl space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-blue/10 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0052FF"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v4l2 2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-gray-200">
              Free Limit Reached
            </h3>
            <p className="text-[10px] text-gray-500">
              {remaining}/{total} generations used today
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Usage bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-gray-500 font-display">
          <span>Daily Usage</span>
          <span>
            {total - remaining}/{total}
          </span>
        </div>
        <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-base-blue to-base-accent rounded-full transition-all"
            style={{ width: `${((total - remaining) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Wait option */}
        <div className="p-3 bg-[#0a0a15] border border-[#2a2a40] rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
            <span className="text-xs text-gray-400 font-display">
              Wait for Tomorrow
            </span>
          </div>
          <p className="text-[10px] text-gray-600 pl-3.5">
            Free tier resets daily at midnight UTC
          </p>
        </div>

        {/* Pay option */}
        <div className="p-3 bg-base-blue/5 border border-base-blue/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-base-mint" />
            <span className="text-xs text-base-accent font-display font-bold">
              Pay with x402
            </span>
            <span className="text-[8px] bg-base-blue/20 text-base-blue px-1.5 py-0.5 rounded font-display font-bold">
              $0.005 USDC
            </span>
          </div>
          <p className="text-[10px] text-gray-500 pl-3.5 mb-2">
            Unlimited generations via micropayment on Base. No subscription, pay per use.
          </p>
          <div className="pl-3.5">
            <p className="text-[9px] text-gray-600 font-display">
              AI agents can use{" "}
              <code className="text-base-accent bg-[#1a1a2e] px-1 py-0.5 rounded text-[8px]">
                POST /api/x402/generate
              </code>{" "}
              with x402 payment header
            </p>
          </div>
        </div>
      </div>

      {/* x402 badge */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-[8px] bg-base-mint/10 text-base-mint px-1.5 py-0.5 rounded font-display font-bold uppercase tracking-wider">
          x402 V2
        </span>
        <span className="text-[8px] text-gray-600 font-display">
          Powered by Coinbase Facilitator
        </span>
      </div>
    </div>
  );
}
