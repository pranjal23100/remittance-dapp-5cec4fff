import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { EscrowCard } from "./EscrowCard";
import { getEscrow, Escrow } from "@/lib/soroban";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

export const EscrowList = () => {
  const [searchId, setSearchId] = useState("");
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchId.trim()) {
      toast.error("Please enter an escrow ID");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const result = await getEscrow(searchId);
      if (result) {
        setEscrow(result);
        toast.success("Escrow found!");
      } else {
        setEscrow(null);
        toast.error("Escrow not found");
      }
    } catch (error) {
      setEscrow(null);
      toast.error("Failed to fetch escrow");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdate = () => {
    // Refresh the escrow data
    handleSearch(new Event("submit") as any);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] border-border/50">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          View Escrow
        </h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchId">Escrow ID</Label>
            <Input
              id="searchId"
              placeholder="e.g., escrow-001"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={isSearching}
              className="bg-background/50 border-border/60 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Escrow
              </>
            )}
          </Button>
        </form>
      </Card>

      {hasSearched && (
        <div>
          {escrow ? (
            <EscrowCard escrow={escrow} onUpdate={handleUpdate} />
          ) : (
            <Card className="p-8 text-center bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-card)] border-border/50">
              <p className="text-muted-foreground">
                No escrow found with ID "{searchId}"
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
