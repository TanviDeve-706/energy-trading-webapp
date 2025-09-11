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
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please make sure MetaMask is installed and unlocked.",
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
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
      data-testid="button-connect-wallet"
    >
      <Wallet size={16} className="mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
