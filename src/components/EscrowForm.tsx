import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createEscrow, parseContractError, getExplorerLink } from "@/lib/soroban";
import { toast } from "sonner";
import { Loader2, Send, ExternalLink } from "lucide-react";

export const EscrowForm = () => {
  const [escrowId, setEscrowId] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
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
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Waiting for signature...");

    try {
      const amountInStroops = (parseFloat(amount) * 10_000_000).toString();
      const txHash = await createEscrow(escrowId, receiver, amountInStroops);

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
      setAmount("");
    } catch (error: any) {
      const errorMessage = parseContractError(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] border-border/50">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Create Escrow
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (XLM)</Label>
          <Input
            id="amount"
            type="number"
            step="0.0000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
            className="bg-background/50 border-border/60 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Amount to lock in escrow
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Escrow...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Create Escrow
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};
