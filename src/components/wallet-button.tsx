import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { setWallet } from "@/lib/profile.functions";
import { toast } from "sonner";
import { Wallet, LogOut, PenLine } from "lucide-react";

export function WalletButton({ initialAddress }: { initialAddress: string | null }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { address: wagmiAddress } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const persist = useServerFn(setWallet);

  const activeAddress = (address ?? wagmiAddress ?? null) as string | null;

  // Persist on connect if it changed from what's in DB
  useEffect(() => {
    if (isConnected && activeAddress && activeAddress.toLowerCase() !== (initialAddress ?? "").toLowerCase()) {
      persist({ data: { address: activeAddress } })
        .then(() => toast.success("Wallet connected"))
        .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to save wallet"));
    }
  }, [isConnected, activeAddress, initialAddress, persist]);

  const handleDisconnect = async () => {
    try {
      disconnect();
      await persist({ data: { address: null } });
      toast.success("Wallet disconnected");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleSignTest = async () => {
    try {
      const sig = await signMessageAsync({
        message: `Protocol Vault test signature\nAddress: ${activeAddress}\nTime: ${new Date().toISOString()}`,
      });
      toast.success(`Signed: ${sig.slice(0, 10)}…${sig.slice(-6)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Signature refused");
    }
  };

  if (isConnected && activeAddress) {
    const short = `${activeAddress.slice(0, 5)}…${activeAddress.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleSignTest}
          disabled={signing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-200/60 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
          title="Sign test message"
        >
          <PenLine className="size-3.5" />
          {signing ? "Signing…" : "Sign test"}
        </button>
        <button
          onClick={() => open({ view: "Account" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 hover:bg-emerald-100 rounded-full transition-colors"
        >
          <div className="size-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono">{short}</span>
        </button>
        <button
          onClick={handleDisconnect}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
          title="Disconnect"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open({ view: "Connect" })}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-700 ring-1 ring-black/5 hover:bg-zinc-200/60 rounded-full text-xs font-medium transition-colors"
    >
      <Wallet className="size-3.5" />
      Connect wallet
    </button>
  );
}
