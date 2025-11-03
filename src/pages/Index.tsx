import { WalletConnectButton } from "@/components/WalletConnectButton";
import { EscrowForm } from "@/components/EscrowForm";
import { EscrowList } from "@/components/EscrowList";
import { Shield, Lock, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-elevated)]">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Soroban Escrow
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure escrow transactions on Stellar's Soroban smart contract platform
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Lock className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Trustless</h3>
            <p className="text-sm text-muted-foreground">
              Smart contract enforced escrow logic
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Shield className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-muted-foreground">
              Built on Stellar's Soroban platform
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-card to-secondary/30 border border-border/50 shadow-[var(--shadow-card)]">
            <Zap className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Fast</h3>
            <p className="text-sm text-muted-foreground">
              Quick transaction finality on testnet
            </p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 flex justify-center">
          <WalletConnectButton />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <EscrowForm />
          </div>
          <div>
            <EscrowList />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a
              href="https://soroban.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Soroban
            </a>{" "}
            and{" "}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Freighter
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
