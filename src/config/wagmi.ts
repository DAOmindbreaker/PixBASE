import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { baseAccount } from "wagmi/connectors";
import { Attribution } from "ox/erc8021";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ["bc_z8mrhec8"],
});

export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: "Pixelon",
    }),
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
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  dataSuffix: DATA_SUFFIX,
});

export const TARGET_CHAIN_ID = base.id;
export const TARGET_CHAIN = base;