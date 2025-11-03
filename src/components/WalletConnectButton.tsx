import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  checkFreighterConnection,
  getWalletPublicKey,
  getAccountBalance,
} from "@/lib/soroban";
import { toast } from "sonner";
import { Wallet, LogOut } from "lucide-react";

export const WalletConnectButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await checkFreighterConnection();
      if (connected) {
        const pubKey = await getWalletPublicKey();
        const bal = await getAccountBalance(pubKey);
        setPublicKey(pubKey);
        setBalance(bal);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Connection check failed:", error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Check if Freighter is installed
      if (!(window as any).freighter) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>Freighter wallet not detected</p>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs"
            >
              Install Freighter Extension
            </a>
          </div>,
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      }

      const pubKey = await getWalletPublicKey();
      const bal = await getAccountBalance(pubKey);
      setPublicKey(pubKey);
      setBalance(bal);
      setIsConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      if (error.message?.includes("User declined")) {
        toast.error("Connection request declined");
      } else {
        toast.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPublicKey("");
    setBalance("0");
    toast.info("Wallet disconnected");
  };

  const truncateKey = (key: string) => {
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        size="lg"
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
      >
        <Wallet className="mr-2 h-5 w-5" />
        {isLoading ? "Connecting..." : "Connect Freighter"}
      </Button>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-secondary/30 shadow-[var(--shadow-card)] border-border/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">
              Connected
            </p>
          </div>
          <p className="font-mono text-sm font-semibold truncate" title={publicKey}>
            {truncateKey(publicKey)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Balance: <span className="font-semibold text-foreground">{parseFloat(balance).toFixed(2)} XLM</span>
          </p>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
