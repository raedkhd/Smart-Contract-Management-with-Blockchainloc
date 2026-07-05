import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, optimism, base, polygon, sepolia } from "@reown/appkit/networks";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string;

export const networks = [mainnet, arbitrum, optimism, base, polygon, sepolia] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [...networks],
  ssr: false,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

let initialized = false;
export function initAppKit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [...networks] as never,
    projectId,
    metadata: {
      name: "Protocol Vault",
      description: "Team workspace for managing EVM smart contracts",
      url: typeof window !== "undefined" ? window.location.origin : "https://guard-chain-studio.lovable.app",
      icons: ["https://guard-chain-studio.lovable.app/favicon.ico"],
    },
    features: { analytics: false, email: false, socials: false },
  });
}
