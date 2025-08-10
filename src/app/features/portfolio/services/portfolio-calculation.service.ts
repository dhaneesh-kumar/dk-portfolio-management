import { Injectable, inject } from '@angular/core';

import { Portfolio, Stock, RebalanceRecommendation } from '../models/portfolio.model';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable()
export class PortfolioCalculationService {
  private readonly logger = inject(LoggerService);

  /**
   * Calculate portfolio metrics and totals
   */
  calculatePortfolioMetrics(portfolio: Portfolio): Portfolio {
    try {
      const enrichedPortfolio = { ...portfolio };
      
      // Calculate total value
      enrichedPortfolio.totalValue = this.calculateTotalValue(portfolio.stocks);
      
      // Calculate total return (simplified calculation)
      enrichedPortfolio.totalReturn = this.calculateTotalReturn(portfolio.stocks);
      
      // Calculate return percentage
      enrichedPortfolio.totalReturnPercent = this.calculateReturnPercentage(
        enrichedPortfolio.totalValue,
        enrichedPortfolio.totalReturn
      );

      // Update stock total values
      enrichedPortfolio.stocks = portfolio.stocks.map(stock => ({
        ...stock,
        totalValue: this.calculateStockValue(stock)
      }));

      this.logger.debug('Portfolio metrics calculated', {
        portfolioId: portfolio.id,
        totalValue: enrichedPortfolio.totalValue,
        totalReturn: enrichedPortfolio.totalReturn
      });

      return enrichedPortfolio;
    } catch (error) {
      this.logger.error('Failed to calculate portfolio metrics', error as Error);
      return portfolio;
    }
  }

  /**
   * Calculate rebalance recommendations
   */
  calculateRebalanceRecommendations(portfolio: Portfolio): RebalanceRecommendation[] {
    try {
      const recommendations: RebalanceRecommendation[] = [];
      const totalValue = this.calculateTotalValue(portfolio.stocks);

      for (const stock of portfolio.stocks) {
        const currentValue = this.calculateStockValue(stock);
        const currentWeight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
        const targetWeight = stock.targetWeight || stock.weight;
        const difference = Math.abs(currentWeight - targetWeight);

        // Only recommend rebalancing if difference is significant (> 2%)
        if (difference > 2) {
          const targetValue = (targetWeight / 100) * totalValue;
          const valueDifference = targetValue - currentValue;
          const recommendedShares = Math.round(valueDifference / stock.currentPrice);

          recommendations.push({
            stock,
            currentWeight,
            targetWeight,
            difference,
            action: valueDifference > 0 ? 'buy' : 'sell',
            recommendedShares: Math.abs(recommendedShares),
            estimatedCost: Math.abs(valueDifference)
          });
        }
      }

      this.logger.info('Rebalance recommendations calculated', {
        portfolioId: portfolio.id,
        recommendationsCount: recommendations.length
      });

      return recommendations.sort((a, b) => b.difference - a.difference);
    } catch (error) {
      this.logger.error('Failed to calculate rebalance recommendations', error as Error);
      return [];
    }
  }

  /**
   * Calculate portfolio risk metrics
   */
  calculateRiskMetrics(portfolio: Portfolio): {
    volatility: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
  } {
    try {
      // Simplified risk calculations for demo
      // In a real application, this would use historical data and complex algorithms
      
      const volatility = this.calculateVolatility(portfolio.stocks);
      const beta = this.calculateBeta(portfolio.stocks);
      const sharpeRatio = this.calculateSharpeRatio(portfolio.totalReturnPercent, volatility);
      const maxDrawdown = this.calculateMaxDrawdown(portfolio.stocks);

      return {
        volatility,
        beta,
        sharpeRatio,
        maxDrawdown
      };
    } catch (error) {
      this.logger.error('Failed to calculate risk metrics', error as Error);
      return {
        volatility: 0,
        beta: 1,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }
  }

  /**
   * Calculate sector allocation
   */
  calculateSectorAllocation(stocks: Stock[]): { [sector: string]: number } {
    const sectorAllocation: { [sector: string]: number } = {};
    const totalValue = this.calculateTotalValue(stocks);

    for (const stock of stocks) {
      const sector = stock.sector || 'Unknown';
      const stockValue = this.calculateStockValue(stock);
      const percentage = totalValue > 0 ? (stockValue / totalValue) * 100 : 0;

      if (sectorAllocation[sector]) {
        sectorAllocation[sector] += percentage;
      } else {
        sectorAllocation[sector] = percentage;
      }
    }

    return sectorAllocation;
  }

  // Private calculation methods

  private calculateTotalValue(stocks: Stock[]): number {
    return stocks.reduce((total, stock) => total + this.calculateStockValue(stock), 0);
  }

  private calculateStockValue(stock: Stock): number {
    return stock.shares * stock.currentPrice;
  }

  private calculateTotalReturn(stocks: Stock[]): number {
    // Simplified calculation - in reality would use purchase prices vs current prices
    return stocks.reduce((total, stock) => {
      const currentValue = this.calculateStockValue(stock);
      const assumedCost = currentValue * 0.9; // Assume 10% gain for demo
      return total + (currentValue - assumedCost);
    }, 0);
  }

  private calculateReturnPercentage(totalValue: number, totalReturn: number): number {
    if (totalValue === 0) return 0;
    const investedAmount = totalValue - totalReturn;
    return investedAmount > 0 ? (totalReturn / investedAmount) * 100 : 0;
  }

  private calculateVolatility(stocks: Stock[]): number {
    // Simplified volatility calculation
    const weights = stocks.map(stock => stock.weight / 100);
    const volatilities = stocks.map(() => Math.random() * 0.3 + 0.1); // Random demo data
    
    let portfolioVolatility = 0;
    for (let i = 0; i < stocks.length; i++) {
      portfolioVolatility += (weights[i] ** 2) * (volatilities[i] ** 2);
    }
    
    return Math.sqrt(portfolioVolatility) * 100;
  }

  private calculateBeta(stocks: Stock[]): number {
    // Simplified beta calculation
    const weights = stocks.map(stock => stock.weight / 100);
    const betas = stocks.map(() => Math.random() * 1.5 + 0.5); // Random demo data
    
    return weights.reduce((total, weight, index) => total + weight * betas[index], 0);
  }

  private calculateSharpeRatio(returnPercent: number, volatility: number): number {
    const riskFreeRate = 6; // Assume 6% risk-free rate
    return volatility > 0 ? (returnPercent - riskFreeRate) / volatility : 0;
  }

  private calculateMaxDrawdown(stocks: Stock[]): number {
    // Simplified max drawdown calculation
    return Math.random() * 20 + 5; // Random demo data between 5-25%
  }
}
