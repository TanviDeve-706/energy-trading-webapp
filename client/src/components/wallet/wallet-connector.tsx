import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletConnector() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet, isConnected } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Your MetaMask wallet has been connected successfully.",
      });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet. Please try again.";
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        data-testid="button-connect-wallet"
      >
        <Wallet size={16} className="mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center">
        <p>Make sure you have MetaMask installed and unlocked.</p>
        <p className="mt-1">
          Don't have MetaMask? 
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline ml-1"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  );
}
