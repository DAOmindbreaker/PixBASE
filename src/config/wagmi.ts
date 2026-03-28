import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Pixelon",
      preference: "smartWalletOnly",
    }),
    injected({
      target: "metaMask",
    }),
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});

export const TARGET_CHAIN_ID = base.id;
export const TARGET_CHAIN = base;