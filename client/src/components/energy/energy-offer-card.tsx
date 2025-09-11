import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Wind, Droplets, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { EnergyOffer } from "@shared/schema";

interface EnergyOfferCardProps {
  offer: EnergyOffer;
}

const energyTypeIcons = {
  solar: Sun,
  wind: Wind,
  hydro: Droplets,
  other: Zap,
};

const energyTypeColors = {
  solar: "energy-gradient",
  wind: "blockchain-gradient", 
  hydro: "bg-blue-500",
  other: "bg-gray-500",
};

export default function EnergyOfferCard({ offer }: EnergyOfferCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const Icon = energyTypeIcons[offer.energyType as keyof typeof energyTypeIcons] || Zap;
  const colorClass = energyTypeColors[offer.energyType as keyof typeof energyTypeColors] || "bg-gray-500";

  const buyEnergyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/transactions', {
        offerId: offer.id,
        buyerId: 'current-user-id', // This should come from auth context
        sellerId: offer.sellerId,
        energyAmount: offer.energyAmount,
        totalPrice: (parseFloat(offer.energyAmount) * parseFloat(offer.pricePerKwh)).toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/energy/offers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Purchase Successful",
        description: "Energy purchase transaction has been initiated.",
      });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "Failed to initiate energy purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBuyEnergy = () => {
    buyEnergyMutation.mutate();
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`offer-card-${offer.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
            <Icon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-medium text-foreground" data-testid={`text-offer-title-${offer.id}`}>
              {offer.energyType.charAt(0).toUpperCase() + offer.energyType.slice(1)} Energy
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-offer-seller-${offer.id}`}>
              {offer.sellerId.slice(0, 6)}...{offer.sellerId.slice(-4)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground" data-testid={`text-offer-amount-${offer.id}`}>
            {offer.energyAmount} kWh
          </p>
          <p className="text-sm text-muted-foreground" data-testid={`text-offer-price-${offer.id}`}>
            {offer.pricePerKwh} ETH/kWh
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge 
            variant={offer.isActive ? "default" : "secondary"}
            data-testid={`badge-offer-status-${offer.id}`}
          >
            {offer.isActive ? "Available" : "Sold"}
          </Badge>
          {offer.location && (
            <span className="text-xs text-muted-foreground" data-testid={`text-offer-location-${offer.id}`}>
              {offer.location}
            </span>
          )}
        </div>
        <Button 
          onClick={handleBuyEnergy}
          disabled={!offer.isActive || buyEnergyMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid={`button-buy-energy-${offer.id}`}
        >
          {buyEnergyMutation.isPending ? "Processing..." : "Buy Energy"}
        </Button>
      </div>
    </div>
  );
}
