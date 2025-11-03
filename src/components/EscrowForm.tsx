import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { createEscrow, parseContractError, getExplorerLink, checkFreighterConnection } from "@/lib/soroban";
import { toast } from "sonner";
import { Loader2, Send, ExternalLink, RefreshCw } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "INR", "GBP", "JPY"];

interface ConversionCache {
  rate: number;
  timestamp: number;
}

const conversionCache: Record<string, ConversionCache> = {};

export const EscrowForm = () => {
  const [escrowId, setEscrowId] = useState("");
  const [receiver, setReceiver] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fiatAmount, setFiatAmount] = useState("");
  const [xlmAmount, setXlmAmount] = useState("");
  const [stroops, setStroops] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const connected = await checkFreighterConnection();
    setIsWalletConnected(connected);
  };

  const fetchXLMPrice = async (fiat: string): Promise<number> => {
    const now = Date.now();
    const cached = conversionCache[fiat];
    
    if (cached && (now - cached.timestamp) < 60000) {
      return cached.rate;
    }

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=${fiat.toLowerCase()}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch price");
      
      const data = await response.json();
      const rate = data.stellar[fiat.toLowerCase()];
      
      conversionCache[fiat] = { rate, timestamp: now };
      return rate;
    } catch (error) {
      console.error("Price fetch error:", error);
      toast.error("Failed to fetch XLM price. Please try again.");
      throw error;
    }
  };

  const convertFiatToXLM = async (fiat: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setXlmAmount("");
      setStroops("");
      return;
    }

    setIsConverting(true);
    try {
      const xlmPrice = await fetchXLMPrice(fiat);
      const fiatValue = parseFloat(amount);
      const xlmValue = fiatValue / xlmPrice;
      const stroopsValue = Math.round(xlmValue * 1e7);

      setXlmAmount(xlmValue.toFixed(7));
      setStroops(stroopsValue.toString());
    } catch (error) {
      setXlmAmount("");
      setStroops("");
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertFiatToXLM(currency, fiatAmount);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currency, fiatAmount]);

  const validateForm = () => {
    if (!isWalletConnected) {
      toast.error("Please connect your Freighter wallet first");
      return false;
    }
    if (!escrowId.trim()) {
      toast.error("Escrow ID is required");
      return false;
    }
    if (!receiver.trim()) {
      toast.error("Receiver address is required");
      return false;
    }
    if (!receiver.startsWith("G") || receiver.length !== 56) {
      toast.error("Invalid Stellar public key");
      return false;
    }
    if (!fiatAmount || parseFloat(fiatAmount) <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }
    if (!stroops || stroops === "0") {
      toast.error("Invalid conversion amount");
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    const toastId = toast.loading("Waiting for Freighter signature...");

    try {
      const txHash = await createEscrow(escrowId, receiver, stroops);

      toast.success(
        <div className="flex flex-col gap-2">
          <p>Escrow created successfully!</p>
          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on Explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>,
        { id: toastId, duration: 8000 }
      );

      // Reset form
      setEscrowId("");
      setReceiver("");
      setFiatAmount("");
      setXlmAmount("");
      setStroops("");
    } catch (error: any) {
      const errorMessage = parseContractError(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] border-border/50">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Create Escrow
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="escrowId">Escrow ID</Label>
          <Input
            id="escrowId"
            placeholder="e.g., escrow-001"
            value={escrowId}
            onChange={(e) => setEscrowId(e.target.value)}
            disabled={isSubmitting}
            className="bg-background/50 border-border/60 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for this escrow
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiver">Receiver Address</Label>
          <Input
            id="receiver"
            placeholder="G..."
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            disabled={isSubmitting}
            className="font-mono text-sm bg-background/50 border-border/60 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Stellar public key (56 characters, starts with G)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={isSubmitting}>
              <SelectTrigger className="bg-background/50 border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiatAmount">Amount</Label>
            <Input
              id="fiatAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={fiatAmount}
              onChange={(e) => setFiatAmount(e.target.value)}
              disabled={isSubmitting}
              className="bg-background/50 border-border/60 focus-visible:ring-primary"
            />
          </div>
        </div>

        {fiatAmount && parseFloat(fiatAmount) > 0 && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Conversion:</span>
              {isConverting && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
            </div>
            <p className="text-lg font-semibold mt-1">
              {currency} {parseFloat(fiatAmount).toLocaleString()} → ≈ {xlmAmount} XLM
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Uses CoinGecko API (cached 60s)
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !isWalletConnected || !xlmAmount || isConverting}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Escrow...
            </>
          ) : !isWalletConnected ? (
            "Connect Wallet First"
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Create Escrow
            </>
          )}
        </Button>
      </form>
    </Card>

    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Escrow Creation</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Please review the escrow details:</p>
            <div className="bg-secondary/30 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow ID:</span>
                <span className="font-mono font-semibold">{escrowId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiver:</span>
                <span className="font-mono text-xs">{receiver.slice(0, 8)}...{receiver.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fiat Amount:</span>
                <span className="font-semibold">{currency} {parseFloat(fiatAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">XLM Amount:</span>
                <span className="font-semibold">{xlmAmount} XLM</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You will be prompted to sign this transaction with Freighter.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmedSubmit}>
            Confirm & Sign
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};
