"use client";

import Link from "next/link";
import { useState } from "react";

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
    desc: "Send image or prompt to Pixelon API",
    color: "bg-base-blue/20 text-base-blue",
  },
  {
    step: "2",
    label: "Pay",
    desc: "$0.005–$0.01 USDC via x402 V2",
    color: "bg-base-accent/20 text-base-accent",
  },
  {
    step: "3",
    label: "Receive",
    desc: "Get 1080x1080 pixel art or AI image",
    color: "bg-base-mint/20 text-base-mint",
  },
];

type CodeTab = "curl" | "typescript" | "python";

const CODE_EXAMPLES: Record<CodeTab, { pixelate: string; generate: string }> = {
  curl: {
    pixelate: `# Pixelate an image ($0.01 USDC via x402)
curl -X POST https://basepixelon.vercel.app/api/pixelate \\
  -F "image=@photo.png" \\
  -F "pixelSize=16" \\
  -F "colorLimit=32" \\
  -o pixel-art.png

# First request returns 402 with payment requirements.
# Use @x402/fetch or x402-compatible client
# to handle payment automatically.`,
    generate: `# AI Generate an image ($0.005 USDC via x402)
curl -X POST https://basepixelon.vercel.app/api/x402/generate \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A cyberpunk cat on a neon rooftop"}'

# Returns JSON with base64 image + metadata
# after x402 payment is settled.`,
  },
  typescript: {
    pixelate: `import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{
    network: "eip155:8453", // Base mainnet
    client: new ExactEvmScheme(account),
  }],
});

// Upload image for pixelation
const formData = new FormData();
formData.append("image", imageFile);
formData.append("pixelSize", "16");
formData.append("colorLimit", "32");

const res = await fetchWithPayment(
  "https://basepixelon.vercel.app/api/pixelate",
  { method: "POST", body: formData }
);

const pixelArt = await res.blob(); // 1080x1080 PNG`,
    generate: `import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);

const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{
    network: "eip155:8453",
    client: new ExactEvmScheme(account),
  }],
});

const res = await fetchWithPayment(
  "https://basepixelon.vercel.app/api/x402/generate",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "A cyberpunk cat on a neon rooftop",
    }),
  }
);

const { imageUrl, metadata } = await res.json();`,
  },
  python: {
    pixelate: `# pip install requests
# x402 payment must be handled via HTTP headers
# See x402.org for Python client libraries

import requests

url = "https://basepixelon.vercel.app/api/pixelate"

# Step 1: Get payment requirements (402 response)
res = requests.post(url, files={"image": open("photo.png", "rb")})

if res.status_code == 402:
    # Parse PAYMENT-REQUIRED header
    payment_req = res.headers.get("PAYMENT-REQUIRED")
    # Create payment signature using your wallet
    # ... (use x402 Python SDK or manual signing)
    
    # Step 2: Retry with PAYMENT-SIGNATURE header
    res = requests.post(url,
        files={"image": open("photo.png", "rb")},
        data={"pixelSize": "16", "colorLimit": "32"},
        headers={"PAYMENT-SIGNATURE": payment_signature}
    )

# Save result
with open("pixel-art.png", "wb") as f:
    f.write(res.content)`,
    generate: `import requests

url = "https://basepixelon.vercel.app/api/x402/generate"

# Step 1: Get payment requirements
res = requests.post(url, json={
    "prompt": "A cyberpunk cat on a neon rooftop"
})

if res.status_code == 402:
    # Handle x402 payment flow
    payment_req = res.headers.get("PAYMENT-REQUIRED")
    # Sign payment with your Base wallet...
    
    # Step 2: Retry with payment
    res = requests.post(url,
        json={"prompt": "A cyberpunk cat on a neon rooftop"},
        headers={"PAYMENT-SIGNATURE": payment_signature}
    )

data = res.json()
image_base64 = data["imageUrl"]  # data:image/jpeg;base64,...
metadata = data["metadata"]`,
  },
};

export default function AgentPage() {
  const [codeTab, setCodeTab] = useState<CodeTab>("typescript");
  const [endpointTab, setEndpointTab] = useState<"pixelate" | "generate">("pixelate");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = CODE_EXAMPLES[codeTab][endpointTab];

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
              x402 V2 on Base Mainnet
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
            Any AI agent on Base can send an image or prompt, pay via x402 V2 micropayment, and receive pixel art back. No API key. No subscription. Just HTTP + USDC.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <span className="text-[9px] bg-base-mint/15 text-base-mint px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              x402 V2
            </span>
            <span className="text-[9px] bg-base-blue/15 text-base-blue px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              ERC-8004
            </span>
            <span className="text-[9px] bg-base-accent/15 text-base-accent px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              Coinbase Facilitator
            </span>
            <span className="text-[9px] bg-base-purple/15 text-base-purple px-2 py-1 rounded font-display font-bold uppercase tracking-wider">
              Base Mainnet
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

      {/* Endpoints */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          API Endpoints
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pixelate endpoint */}
          <div className="p-5 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-base-blue/20 text-base-blue px-2 py-1 rounded font-display font-bold">POST</span>
              <code className="text-sm text-gray-300 font-mono">/api/pixelate</code>
            </div>
            <p className="text-xs text-gray-500">Convert any image to 1080x1080 pixel art</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Price</span>
                <span className="text-base-mint font-bold">$0.01 USDC</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Input</span>
                <span className="text-gray-500">multipart/form-data</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Output</span>
                <span className="text-gray-500">image/png (1080x1080)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Network</span>
                <span className="text-gray-500">eip155:8453 (Base)</span>
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <p className="text-[9px] text-gray-600 font-display uppercase tracking-wider">Parameters</p>
              <div className="flex justify-between text-[10px]">
                <code className="text-base-accent">image</code>
                <span className="text-gray-500">file, required</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">pixelSize</code>
                <span className="text-gray-500">4-64, default 16</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">colorLimit</code>
                <span className="text-gray-500">0-256, 0 = full</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">brightness</code>
                <span className="text-gray-500">-50 to 50</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">contrast</code>
                <span className="text-gray-500">0.5 to 2.0</span>
              </div>
            </div>
          </div>

          {/* Generate endpoint */}
          <div className="p-5 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-base-purple/20 text-base-purple px-2 py-1 rounded font-display font-bold">POST</span>
              <code className="text-sm text-gray-300 font-mono">/api/x402/generate</code>
            </div>
            <p className="text-xs text-gray-500">AI-generate an image from a text prompt</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Price</span>
                <span className="text-base-mint font-bold">$0.005 USDC</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Input</span>
                <span className="text-gray-500">application/json</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Output</span>
                <span className="text-gray-500">JSON (base64 image)</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Network</span>
                <span className="text-gray-500">eip155:8453 (Base)</span>
              </div>
            </div>
            <div className="pt-2 space-y-1">
              <p className="text-[9px] text-gray-600 font-display uppercase tracking-wider">Parameters</p>
              <div className="flex justify-between text-[10px]">
                <code className="text-base-accent">prompt</code>
                <span className="text-gray-500">string, required</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">pixelSize</code>
                <span className="text-gray-500">optional, default 16</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <code className="text-gray-400">colorLimit</code>
                <span className="text-gray-500">optional, default 0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Free endpoint note */}
        <div className="mt-4 p-4 bg-base-mint/5 border border-base-mint/10 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] bg-base-mint/15 text-base-mint px-1.5 py-0.5 rounded font-display font-bold">FREE</span>
            <code className="text-xs text-gray-300 font-mono">POST /api/generate</code>
          </div>
          <p className="text-[10px] text-gray-500">
            Human users get 5 free AI generations per day. No x402 payment needed. After limit, use the paid <code className="text-base-accent">/api/x402/generate</code> endpoint.
          </p>
        </div>
      </section>

      {/* Code Examples */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          Code Examples
        </h3>

        <div className="bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-[#1a1a2e] px-4">
            {/* Language tabs */}
            <div className="flex gap-1 py-2">
              {(["typescript", "curl", "python"] as CodeTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider transition-all",
                    codeTab === tab
                      ? "bg-base-blue text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a2e]",
                  ].join(" ")}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Endpoint tabs */}
            <div className="flex gap-1 py-2">
              <button
                onClick={() => setEndpointTab("pixelate")}
                className={[
                  "px-2.5 py-1 rounded text-[9px] font-display transition-all",
                  endpointTab === "pixelate"
                    ? "bg-base-accent/20 text-base-accent"
                    : "text-gray-600 hover:text-gray-400",
                ].join(" ")}
              >
                /pixelate
              </button>
              <button
                onClick={() => setEndpointTab("generate")}
                className={[
                  "px-2.5 py-1 rounded text-[9px] font-display transition-all",
                  endpointTab === "generate"
                    ? "bg-base-purple/20 text-base-purple"
                    : "text-gray-600 hover:text-gray-400",
                ].join(" ")}
              >
                /x402/generate
              </button>
            </div>
          </div>

          {/* Code block */}
          <div className="relative">
            <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto leading-relaxed">
              <code>{currentCode}</code>
            </pre>
            <button
              onClick={() => handleCopy(currentCode)}
              className="absolute top-3 right-3 px-2 py-1 bg-[#1a1a2e] border border-[#2a2a40] rounded text-[9px] text-gray-500 hover:text-white transition-colors font-display"
            >
              {copied ? "\u2713 Copied" : "Copy"}
            </button>
          </div>
        </div>
      </section>

      {/* x402 V2 Details */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h3 className="font-display text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
          x402 V2 Protocol Details
        </h3>

        <div className="p-6 bg-[#111122]/60 border border-[#1a1a2e] rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-display uppercase tracking-wider">Protocol</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Version</span>
                  <span className="text-base-accent font-bold">x402 V2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Scheme</span>
                  <span className="text-gray-500">exact (EIP-3009)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Asset</span>
                  <span className="text-gray-500">USDC</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Network</span>
                  <span className="text-gray-500">eip155:8453 (Base)</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-display uppercase tracking-wider">Infrastructure</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Facilitator</span>
                  <span className="text-base-mint">Coinbase (Free)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Settlement</span>
                  <span className="text-gray-500">Instant on Base</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Fees</span>
                  <span className="text-gray-500">$0 (gasless via EIP-3009)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">SDK</span>
                  <span className="text-gray-500">@x402/fetch, @x402/evm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a1a2e]">
            <p className="text-[10px] text-gray-500 font-display uppercase tracking-wider mb-2">x402 Payment Flow</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 flex-wrap">
              <span className="px-2 py-1 bg-[#1a1a2e] rounded">1. POST /api/pixelate</span>
              <span className="text-gray-600">{"\u2192"}</span>
              <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded">402 + PAYMENT-REQUIRED</span>
              <span className="text-gray-600">{"\u2192"}</span>
              <span className="px-2 py-1 bg-base-blue/10 text-base-blue rounded">Sign USDC transfer</span>
              <span className="text-gray-600">{"\u2192"}</span>
              <span className="px-2 py-1 bg-base-mint/10 text-base-mint rounded">200 + pixel art</span>
            </div>
          </div>
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="p-8 bg-gradient-to-br from-base-blue/10 to-base-mint/5 border border-base-blue/20 rounded-2xl text-center space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            Ready to integrate?
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Install the x402 SDK and start making paid API calls in minutes. No API key needed — just a wallet with USDC on Base.
          </p>
          <div className="p-3 bg-[#0a0a15] rounded-xl max-w-md mx-auto">
            <code className="text-xs text-base-accent font-mono">
              npm install @x402/fetch @x402/evm @x402/core
            </code>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-base-blue hover:bg-blue-600 text-white font-display text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              x402 Docs
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
            {"Pixelon \u00B7 x402 V2 Agent API on Base"}
          </p>
          <div className="flex gap-4">
            <a
              href="https://x402.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"x402.org \u2197"}
            </a>
            <a
              href="https://docs.cdp.coinbase.com/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"CDP Docs \u2197"}
            </a>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-base-blue transition-colors font-display"
            >
              {"Base \u2197"}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
