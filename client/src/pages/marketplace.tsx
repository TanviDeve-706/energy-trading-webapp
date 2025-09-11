import Header from "@/components/layout/header";
import EnergyOfferCard from "@/components/energy/energy-offer-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { EnergyOffer } from "@shared/schema";

export default function Marketplace() {
  const { data: offersData, isLoading } = useQuery<{ offers: EnergyOffer[] }>({
    queryKey: ['/api/energy/offers'],
  });

  const offers = offersData?.offers || [];

  return (
    <div>
      <Header 
        title="Energy Marketplace"
        subtitle="Browse and purchase energy from prosumers in your area"
      />

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground" data-testid="text-filters-title">Filter Offers</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg" data-testid="button-filter-all">
                    All Types
                  </button>
                  <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg" data-testid="button-filter-solar">
                    Solar
                  </button>
                  <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg" data-testid="button-filter-wind">
                    Wind
                  </button>
                  <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg" data-testid="button-filter-hydro">
                    Hydro
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))
          ) : offers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg" data-testid="text-no-offers">No energy offers available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later or create your own offer if you're a prosumer.</p>
            </div>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="bg-card rounded-xl shadow-sm border border-border">
                <EnergyOfferCard offer={offer} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
