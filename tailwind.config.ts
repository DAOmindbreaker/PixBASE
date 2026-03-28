import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          blue: "#0052FF",
          dark: "#0A0A0A",
          gray: "#1A1A2E",
          accent: "#00D4FF",
          mint: "#00FF94",
          purple: "#7B61FF",
          ember: "#FF6B35",
        },
      },
      fontFamily: {
        display: ['"Space Mono"', "monospace"],
        body: ['"DM Sans"', "sans-serif"],
      },
      animation: {
        "pixel-in": "pixelIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        pixelIn: {
          "0%": { transform: "scale(0.8)", opacity: "0", filter: "blur(8px)" },
          "100%": { transform: "scale(1)", opacity: "1", filter: "blur(0px)" },
        },
        fadeUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 82, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 82, 255, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
