import { useState, useEffect } from 'react';
import { energySimulator } from '@/lib/energy-simulation';

export interface EnergyData {
  // Prosumer data
  generated?: number;
  sold?: number;
  earnings?: number;
  activeOffers?: number;
  currentOutput?: number;
  dailyGeneration?: number;
  availableToSell?: number;
  
  // Consumer data
  purchased?: number;
  spent?: number;
  savings?: number;
  transactionCount?: number;
  
  // Market data
  marketPrice?: number;
  networkHealth?: 'good' | 'congested' | 'poor';
  gasPrice?: number;
}

export function useEnergyData() {
  const [energyData, setEnergyData] = useState<EnergyData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateEnergyData = () => {
      const solarData = energySimulator.generateSolarData();
      const marketPrice = energySimulator.generateMarketPrice();
      const networkInfo = energySimulator.simulateNetworkCongestion();

      // Simulate prosumer data
      const prosumerData = {
        generated: solarData.dailyGeneration,
        sold: solarData.dailyGeneration * 0.6, // 60% sold
        earnings: (solarData.dailyGeneration * 0.6 * marketPrice),
        activeOffers: Math.floor(Math.random() * 8) + 2, // 2-10 offers
        currentOutput: solarData.currentOutput,
        dailyGeneration: solarData.dailyGeneration,
        availableToSell: solarData.availableToSell,
      };

      // Simulate consumer data
      const consumerData = {
        purchased: 45.8 + (Math.random() * 10 - 5), // Random variation
        spent: 1.83 + (Math.random() * 0.4 - 0.2),
        savings: 0.65 + (Math.random() * 0.2 - 0.1),
        transactionCount: Math.floor(Math.random() * 5) + 10, // 10-15 transactions
      };

      setEnergyData({
        ...prosumerData,
        ...consumerData,
        marketPrice,
        networkHealth: networkInfo.networkHealth,
        gasPrice: networkInfo.gasPrice,
      });
      
      setIsLoading(false);
    };

    // Initial update
    updateEnergyData();

    // Update every 30 seconds
    const interval = setInterval(updateEnergyData, 30000);

    return () => clearInterval(interval);
  }, []);

  return { energyData, isLoading };
}
