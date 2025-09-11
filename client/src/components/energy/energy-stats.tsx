import { Card, CardContent } from "@/components/ui/card";
import { Sun, Handshake, Coins, List, ArrowUp } from "lucide-react";
import { useEnergyData } from "@/hooks/use-energy-data";
import { Skeleton } from "@/components/ui/skeleton";

interface EnergyStatsProps {
  userType: 'prosumer' | 'consumer';
}

export default function EnergyStats({ userType }: EnergyStatsProps) {
  const { energyData, isLoading } = useEnergyData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const prosumerStats = [
    {
      title: "Energy Generated",
      value: `${energyData?.generated || 142.5} kWh`,
      icon: Sun,
      color: "energy-gradient",
      trend: "+12% from yesterday",
      testId: "stat-energy-generated"
    },
    {
      title: "Energy Sold",
      value: `${energyData?.sold || 87.2} kWh`,
      icon: Handshake,
      color: "blockchain-gradient",
      trend: "+8% from yesterday",
      testId: "stat-energy-sold"
    },
    {
      title: "Total Earnings",
      value: `${energyData?.earnings || 2.47} ETH`,
      icon: Coins,
      color: "bg-accent",
      trend: "+15% from yesterday",
      testId: "stat-total-earnings"
    },
    {
      title: "Active Offers",
      value: energyData?.activeOffers?.toString() || "5",
      icon: List,
      color: "bg-secondary",
      trend: "2 pending, 3 active",
      testId: "stat-active-offers"
    }
  ];

  const consumerStats = [
    {
      title: "Energy Purchased",
      value: `${energyData?.purchased || 45.8} kWh`,
      icon: Handshake,
      color: "blockchain-gradient",
      trend: "+5% from yesterday",
      testId: "stat-energy-purchased"
    },
    {
      title: "Total Spent",
      value: `${energyData?.spent || 1.83} ETH`,
      icon: Coins,
      color: "bg-accent",
      trend: "+3% from yesterday",
      testId: "stat-total-spent"
    },
    {
      title: "Savings",
      value: `${energyData?.savings || 0.65} ETH`,
      icon: Sun,
      color: "energy-gradient",
      trend: "vs grid prices",
      testId: "stat-savings"
    },
    {
      title: "Transactions",
      value: energyData?.transactionCount?.toString() || "12",
      icon: List,
      color: "bg-secondary",
      trend: "This month",
      testId: "stat-transactions"
    }
  ];

  const stats = userType === 'prosumer' ? prosumerStats : consumerStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.testId} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1" data-testid={stat.testId}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-primary text-sm">
                  <ArrowUp size={12} className="mr-1" />
                  <span data-testid={`${stat.testId}-trend`}>{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
