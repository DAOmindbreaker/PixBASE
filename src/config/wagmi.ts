import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Ganti dengan Builder Code kamu dari base.dev > Settings > Builder Code
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_z8mrhec8"],
});

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
  dataSuffix: DATA_SUFFIX,
});

export const TARGET_CHAIN_ID = base.id;
export const TARGET_CHAIN = base;