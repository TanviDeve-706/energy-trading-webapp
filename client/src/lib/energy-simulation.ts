export interface EnergyGenerationData {
  currentOutput: number;
  dailyGeneration: number;
  availableToSell: number;
  efficiency: number;
}

export interface EnergyConsumptionData {
  currentConsumption: number;
  dailyConsumption: number;
  peakHours: number[];
}

export class EnergySimulator {
  private lastUpdate: Date = new Date();
  private baseGeneration: number = 5; // Base generation in kW
  private baseConsumption: number = 3; // Base consumption in kW

  generateSolarData(): EnergyGenerationData {
    const now = new Date();
    const hour = now.getHours();
    
    // Solar generation varies by time of day (peak at noon)
    let solarMultiplier = 0;
    if (hour >= 6 && hour <= 18) {
      // Simulate sun hours with peak at noon
      const peakHour = 12;
      const hourOffset = Math.abs(hour - peakHour);
      solarMultiplier = Math.max(0, 1 - (hourOffset / 6)) + (Math.random() * 0.2 - 0.1);
    }

    // Add some randomness for weather conditions
    const weatherVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2

    const currentOutput = Math.max(0, this.baseGeneration * solarMultiplier * weatherVariation);
    
    // Daily generation (simplified calculation)
    const dailyGeneration = currentOutput * 8; // Assume 8 hours of effective sunlight
    
    // Available to sell (assume 60% of generation can be sold)
    const availableToSell = dailyGeneration * 0.6;
    
    // Efficiency based on current conditions
    const efficiency = Math.min(100, solarMultiplier * weatherVariation * 100);

    return {
      currentOutput: Math.round(currentOutput * 100) / 100,
      dailyGeneration: Math.round(dailyGeneration * 100) / 100,
      availableToSell: Math.round(availableToSell * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
    };
  }

  generateWindData(): EnergyGenerationData {
    // Wind is more variable and can generate at night
    const windSpeed = 5 + (Math.random() * 15); // 5-20 m/s
    const windMultiplier = Math.min(1, windSpeed / 15); // Normalize to 0-1
    
    const currentOutput = this.baseGeneration * windMultiplier;
    const dailyGeneration = currentOutput * 12; // Wind can work 12 hours effectively
    const availableToSell = dailyGeneration * 0.7;
    const efficiency = windMultiplier * 100;

    return {
      currentOutput: Math.round(currentOutput * 100) / 100,
      dailyGeneration: Math.round(dailyGeneration * 100) / 100,
      availableToSell: Math.round(availableToSell * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
    };
  }

  generateConsumptionData(): EnergyConsumptionData {
    const now = new Date();
    const hour = now.getHours();
    
    // Consumption varies by time (higher in morning and evening)
    let consumptionMultiplier = 0.5; // Base consumption
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 22)) {
      consumptionMultiplier = 1; // Peak hours
    } else if (hour >= 10 && hour <= 16) {
      consumptionMultiplier = 0.7; // Day hours
    }

    const currentConsumption = this.baseConsumption * consumptionMultiplier * (0.8 + Math.random() * 0.4);
    const dailyConsumption = this.baseConsumption * 16; // Average over 24 hours
    
    return {
      currentConsumption: Math.round(currentConsumption * 100) / 100,
      dailyConsumption: Math.round(dailyConsumption * 100) / 100,
      peakHours: [7, 8, 18, 19, 20],
    };
  }

  generateMarketPrice(): number {
    // Simulate energy market price in ETH per kWh
    const basePrice = 0.05;
    const marketVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    const timeBasedVariation = this.getTimeBasedPriceMultiplier();
    
    return Math.round(basePrice * marketVariation * timeBasedVariation * 1000) / 1000;
  }

  private getTimeBasedPriceMultiplier(): number {
    const hour = new Date().getHours();
    
    // Higher prices during peak consumption hours
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 22)) {
      return 1.2; // Peak hours
    } else if (hour >= 23 || hour <= 5) {
      return 0.7; // Off-peak hours
    }
    return 1; // Normal hours
  }

  simulateNetworkCongestion(): {
    gasPrice: number;
    confirmationTime: number;
    networkHealth: 'good' | 'congested' | 'poor';
  } {
    const congestionLevel = Math.random();
    
    let gasPrice: number;
    let confirmationTime: number;
    let networkHealth: 'good' | 'congested' | 'poor';

    if (congestionLevel < 0.6) {
      gasPrice = 20 + (Math.random() * 10); // 20-30 gwei
      confirmationTime = 1 + (Math.random() * 2); // 1-3 minutes
      networkHealth = 'good';
    } else if (congestionLevel < 0.9) {
      gasPrice = 30 + (Math.random() * 20); // 30-50 gwei
      confirmationTime = 3 + (Math.random() * 5); // 3-8 minutes
      networkHealth = 'congested';
    } else {
      gasPrice = 50 + (Math.random() * 50); // 50-100 gwei
      confirmationTime = 8 + (Math.random() * 12); // 8-20 minutes
      networkHealth = 'poor';
    }

    return {
      gasPrice: Math.round(gasPrice),
      confirmationTime: Math.round(confirmationTime * 100) / 100,
      networkHealth,
    };
  }
}

export const energySimulator = new EnergySimulator();
