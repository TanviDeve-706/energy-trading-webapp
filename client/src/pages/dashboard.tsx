import Header from "@/components/layout/header";
import EnergyStats from "@/components/energy/energy-stats";
import EnergyOfferCard from "@/components/energy/energy-offer-card";
import CreateOfferForm from "@/components/energy/create-offer-form";
import TransactionHistory from "@/components/energy/transaction-history";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import type { EnergyOffer } from "@shared/schema";

export default function Dashboard() {
  const { user, updateUserType } = useAuth();

  const { data: offersData, isLoading: offersLoading } = useQuery<{ offers: EnergyOffer[] }>({
    queryKey: ['/api/energy/offers'],
  });

  const offers = offersData?.offers || [];
  const userType = user?.userType || 'consumer';

  const handleUserTypeToggle = (type: 'prosumer' | 'consumer') => {
    updateUserType(type);
  };

  return (
    <div>
      <Header 
        title="Energy Trading Dashboard"
        subtitle="Manage your energy trades and monitor market activity"
        userType={userType}
        onUserTypeChange={handleUserTypeToggle}
      />

      <div className="px-8 py-6">
        <EnergyStats userType={userType} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Energy Marketplace */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-sm border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground" data-testid="text-marketplace-title">Energy Marketplace</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full" data-testid="button-filter-all">
                      All
                    </button>
                    <button className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground rounded-full" data-testid="button-filter-solar">
                      Solar
                    </button>
                    <button className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground rounded-full" data-testid="button-filter-wind">
                      Wind
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {offersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground" data-testid="text-no-offers">No energy offers available at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <EnergyOfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {userType === 'prosumer' && <CreateOfferForm />}
            <TransactionHistory />
            
            {/* Energy Generation Status for Prosumers */}
            {userType === 'prosumer' && (
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground" data-testid="text-generation-title">Energy Generation</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Output</span>
                      <span className="text-sm font-medium text-foreground" data-testid="text-current-output">3.2 kW</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '64%'}}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Today's Total</span>
                      <span className="text-sm font-medium text-foreground" data-testid="text-today-total">28.7 kWh</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available to Sell</span>
                      <span className="text-sm font-medium text-accent" data-testid="text-available-sell">15.3 kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
