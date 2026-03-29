"use client";

import Link from "next/link";

const USE_CASES = [
  {
    icon: "\uD83D\uDDBC\uFE0F",
    title: "NFT Marketplaces",
    desc: "Auto-generate pixel art thumbnails for collections and listings",
  },
  {
    icon: "\uD83E\uDD16",
    title: "Social Agents",
    desc: "Create unique pixel avatars for users on-the-fly",
  },
  {
    icon: "\uD83C\uDFAE",
    title: "Gaming Agents",
    desc: "Generate pixel sprites, items, and map tiles on demand",
  },
  {
    icon: "\uD83C\uDFA8",
    title: "Creative Agents",
    desc: "Transform any photo into pixel art for minting or sharing",
  },
];

const FLOW_STEPS = [
  {
    step: "1",
    label: "Request",
    desc: "Agent sends image to /api/pixelate",
    color: "bg-base-blue/20 text-base-blue",
  },
  {
    step: "2",
    label: "Pay",
    desc: "$0.01 USDC via x402 on Base",
    color: "bg-base-accent/20 text-base-accent",
  },
  {
    step: "3",
    label: "Receive",
    desc: "Get 1080x1080 pixel art PNG",
    color: "bg-base-mint/20 text-base-mint",
  },
];

export default function AgentPage() {
  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-[#1a1a2e]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full">
                <div className="bg-base-blue rounded-[2px]" />
                <div className="bg-base-accent rounded-[2px]" />
                <div className="bg-base-blue/60 rounded-[2px]" />
                <div className="bg-base-accent/60 rounded-[2px]" />
                <div className="bg-base-mint rounded-[2px]" />
                <div className="bg-base-accent rounded-[2px]" />
                <div className="bg-base-blue/30 rounded-[2px]" />
                <div className="bg-base-blue/60 rounded-[2px]" />
                <div className="bg-base-blue rounded-[2px]" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-white tracking-tight group-hover:text-base-blue transition-colors">
                Pixelon
              </h1>
              <p className="text-[9px] text-gray-500 font-display uppercase tracking-widest">
                AI Agent API
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors font-display px-3 py-1.5 rounded-lg border border-[#2a2a40] hover:border-[#3a3a55]"
          >
            {"Open App \u2192"}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-base-blue/10 border border-base-blue/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-base-mint animate-pulse" />
            <span className="text-[11px] font-display text-base-accent font-bold uppercase tracking-wider">
              Live on Base Mainnet
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            {"Pixel Art as a Service"}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-base-accent to-base-mint">
              for AI Agents
            </span>
          </h2>

          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            Pixelon exposes a paid API endpoint where any AI agent on Base can send an image, pay $0.01 USDC via x402, and receive pixel art back. No API key. No subscription. Just pay and receive.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-[9px] bg-base-mint/15 text-base-mint px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              x402
            </span>
            <span className="text-[9px] bg-base-blue/15 text-base-blue px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              ERC-8004
            </span>
            <span className="text-[9px] bg-base-accent/15 text-base-accent px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              pixelon.base.eth
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          How it works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FLOW_STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="p-5 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl text-center space-y-3">
                <div className={["w-10 h-10 rounded-xl mx-auto flex items-center justify-center font-display text-lg font-bold", s.color].join(" ")}>
                  {s.step}
                </div>
                <h4 className="font-display text-sm font-bold text-gray-200">{s.label}</h4>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden sm:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-600 z-10">
                  {"\u2192"}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          Who uses this?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="p-5 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl flex items-start gap-4 hover:border-base-blue/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-xl flex-shrink-0">
                {uc.icon}
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-gray-200 mb-1">{uc.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical details */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          Endpoint Details
        </h3>

        <div className="p-6 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-base-blue/20 text-base-blue px-2 py-1 rounded font-display font-bold">
              POST
            </span>
            <code className="text-sm text-gray-300 font-mono">
              /api/pixelate
            </code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-display uppercase tracking-wider">Input</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <code className="text-base-accent">image</code>
                  <span className="text-gray-500">file, required</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <code className="text-gray-400">pixelSize</code>
                  <span className="text-gray-500">4-64, default 16</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <code className="text-gray-400">colorLimit</code>
                  <span className="text-gray-500">0 = unlimited</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <code className="text-gray-400">brightness</code>
                  <span className="text-gray-500">-50 to 50</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <code className="text-gray-400">contrast</code>
                  <span className="text-gray-500">0.5 to 2.0</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-display uppercase tracking-wider">Output</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Format</span>
                  <span className="text-gray-500">image/png</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Size</span>
                  <span className="text-gray-500">1080 x 1080px</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Payment</span>
                  <span className="text-base-mint">$0.01 USDC</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Network</span>
                  <span className="text-gray-500">Base Mainnet</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Protocol</span>
                  <span className="text-gray-500">x402</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 bg-gradient-to-br from-base-blue/10 to-base-mint/5 border border-base-blue/20 rounded-2xl text-center space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            Ready to integrate?
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Read the SKILL.md for full technical documentation, or try the web app to see Pixelon in action.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="https://basepixelon.vercel.app/.well-known/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              View SKILL.md
            </a>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#111122] border border-[#2a2a40] hover:border-[#3a3a55] text-gray-300 hover:text-white font-display text-sm rounded-xl transition-all"
            >
              Try Web App
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-6 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 font-display">
            {"Pixelon \u00B7 AI Agent on Base"}
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.8004scan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"ERC-8004 \u2197"}
            </a>
            <a
              href="https://base.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"base.dev \u2197"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
