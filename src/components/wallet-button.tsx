import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { setWallet } from "@/lib/profile.functions";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

export function WalletButton({ initialAddress }: { initialAddress: string | null }) {
  const [address, setAddress] = useState<string | null>(initialAddress);
  const persist = useServerFn(setWallet);

  useEffect(() => setAddress(initialAddress), [initialAddress]);

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("No EVM wallet detected. Install MetaMask.");
      return;
    }
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const addr = accounts?.[0];
      if (!addr) throw new Error("No account returned");
      await persist({ data: { address: addr } });
      setAddress(addr);
      toast.success("Wallet connected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  if (address) {
    const short = `${address.slice(0, 5)}…${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 rounded-full">
        <div className="size-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs font-mono">{short}</span>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-200/60 rounded-full text-xs font-medium transition-colors"
    >
      <Wallet className="size-3.5" />
      Connect wallet
    </button>
  );
}
