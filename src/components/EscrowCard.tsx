import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Escrow,
  releaseEscrow,
  refundEscrow,
  parseContractError,
  getExplorerLink,
  getWalletPublicKey,
} from "@/lib/soroban";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface EscrowCardProps {
  escrow: Escrow;
  onUpdate?: () => void;
}

export const EscrowCard = ({ escrow, onUpdate }: EscrowCardProps) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [currentUserKey, setCurrentUserKey] = useState<string>("");

  useState(() => {
    getWalletPublicKey().then(setCurrentUserKey).catch(() => {});
  });

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 10_000_000).toFixed(7);
  };

  const isSender = currentUserKey === escrow.sender;

  const handleRelease = async () => {
    setIsReleasing(true);
    const toastId = toast.loading("Waiting for signature...");

    try {
      const txHash = await releaseEscrow(escrow.id);
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Escrow released successfully!</p>
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
      onUpdate?.();
    } catch (error: any) {
      const errorMessage = parseContractError(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsReleasing(false);
    }
  };

  const handleRefund = async () => {
    setIsRefunding(true);
    const toastId = toast.loading("Waiting for signature...");

    try {
      const txHash = await refundEscrow(escrow.id);
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Escrow refunded successfully!</p>
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
      onUpdate?.();
    } catch (error: any) {
      const errorMessage = parseContractError(error);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] border-border/50 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-mono">{escrow.id}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {formatAmount(escrow.amount)} XLM
          </p>
        </div>
        <Badge
          variant={escrow.completed ? "default" : "secondary"}
          className={
            escrow.completed
              ? "bg-success text-success-foreground"
              : "bg-warning text-warning-foreground"
          }
        >
          {escrow.completed ? "Completed" : "Pending"}
        </Badge>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sender:</span>
          <span className="font-mono font-medium" title={escrow.sender}>
            {truncateAddress(escrow.sender)}
            {isSender && (
              <Badge variant="outline" className="ml-2 text-xs">
                You
              </Badge>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Receiver:</span>
          <span className="font-mono font-medium" title={escrow.receiver}>
            {truncateAddress(escrow.receiver)}
          </span>
        </div>
      </div>

      {!escrow.completed && isSender && (
        <div className="flex gap-3">
          <Button
            onClick={handleRelease}
            disabled={isReleasing || isRefunding}
            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
          >
            {isReleasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Releasing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Release
              </>
            )}
          </Button>
          <Button
            onClick={handleRefund}
            disabled={isReleasing || isRefunding}
            variant="destructive"
            className="flex-1"
          >
            {isRefunding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refunding...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Refund
              </>
            )}
          </Button>
        </div>
      )}

      {escrow.completed && (
        <div className="text-center text-sm text-muted-foreground italic">
          This escrow has been completed
        </div>
      )}
    </Card>
  );
};
