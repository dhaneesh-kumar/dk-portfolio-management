import { Injectable, inject } from "@angular/core";

import {
  Portfolio,
  Stock,
  RebalanceRecommendation,
  PriceHistory,
  AddStockDto,
} from "../models/portfolio.model";
import { LoggerService } from "../../../core/services/logger.service";

@Injectable()
export class PortfolioCalculationService {
  private readonly logger = inject(LoggerService);

  /**
   * Calculate maximum number of stocks based on allocation constraints
   */
  calculateMaxStocksAllowed(portfolio: Portfolio): number {
    if (portfolio.maxStockAllocationPercent <= 0) return portfolio.maxStocks;

    // Calculate based on minimum allocation percentage
    const maxBasedOnAllocation = Math.floor(100 / portfolio.maxStockAllocationPercent);
    return Math.min(portfolio.maxStocks, maxBasedOnAllocation);
  }

  /**
   * Validate stock allocation percentage
   */
  validateStockAllocation(portfolio: Portfolio, allocationPercent: number, excludeStockId?: string): {
    isValid: boolean;
    currentTotalAllocation: number;
    remainingAllocation: number;
    maxAllowedForStock: number;
  } {
    const currentTotalAllocation = portfolio.stocks
      .filter(stock => !excludeStockId || stock.id !== excludeStockId)
      .reduce((sum, stock) => sum + (stock.weight || 0), 0);

    const remainingAllocation = 100 - currentTotalAllocation;
    const maxAllowedForStock = Math.min(portfolio.maxStockAllocationPercent, remainingAllocation);

    return {
      isValid: allocationPercent <= maxAllowedForStock && allocationPercent > 0,
      currentTotalAllocation,
      remainingAllocation,
      maxAllowedForStock
    };
  }

  /**
   * Calculate suggested number of shares based on allocation percentage
   */
  calculateSharesFromAllocation(portfolio: Portfolio, stockPrice: number, allocationPercent: number): {
    suggestedShares: number;
    estimatedValue: number;
    actualAllocation: number;
  } {
    const targetValue = (portfolio.budget * allocationPercent) / 100;
    const suggestedShares = Math.floor(targetValue / stockPrice);
    const estimatedValue = suggestedShares * stockPrice;
    const actualAllocation = portfolio.budget > 0 ? (estimatedValue / portfolio.budget) * 100 : 0;

    return {
      suggestedShares,
      estimatedValue,
      actualAllocation
    };
  }

  /**
   * Calculate portfolio cash management
   */
  calculateCashPosition(portfolio: Portfolio): {
    totalInvested: number;
    availableCash: number;
    cashAllocationPercent: number;
  } {
    const totalInvested = portfolio.stocks
      .filter(stock => !stock.isCashStock)
      .reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);

    const availableCash = portfolio.budget - totalInvested;
    const cashAllocationPercent = portfolio.budget > 0 ? (availableCash / portfolio.budget) * 100 : 0;

    return {
      totalInvested,
      availableCash,
      cashAllocationPercent
    };
  }

  /**
   * Calculate portfolio metrics and totals
   */
  calculatePortfolioMetrics(portfolio: Portfolio): Portfolio {
    try {
      const enrichedPortfolio = { ...portfolio };

      // Calculate total value
      enrichedPortfolio.totalValue = this.calculateTotalValue(portfolio.stocks);

      // Calculate total return (simplified calculation)
      enrichedPortfolio.totalReturn = this.calculateTotalReturn(
        portfolio.stocks,
      );

      // Calculate return percentage
      enrichedPortfolio.totalReturnPercent = this.calculateReturnPercentage(
        enrichedPortfolio.totalValue,
        enrichedPortfolio.totalReturn,
      );

      // Update cash position
      const cashPosition = this.calculateCashPosition(portfolio);
      enrichedPortfolio.availableCash = cashPosition.availableCash;

      // Update stock total values and ensure weight calculations
      enrichedPortfolio.stocks = portfolio.stocks.map((stock) => ({
        ...stock,
        totalValue: this.calculateStockValue(stock),
        weight: enrichedPortfolio.totalValue > 0 ?
          (this.calculateStockValue(stock) / enrichedPortfolio.totalValue) * 100 : 0
      }));

      this.logger.debug("Portfolio metrics calculated", {
        portfolioId: portfolio.id,
        totalValue: enrichedPortfolio.totalValue,
        totalReturn: enrichedPortfolio.totalReturn,
      });

      return enrichedPortfolio;
    } catch (error) {
      this.logger.error(
        "Failed to calculate portfolio metrics",
        error as Error,
      );
      return portfolio;
    }
  }

  /**
   * Calculate rebalance recommendations
   */
  calculateRebalanceRecommendations(
    portfolio: Portfolio,
  ): RebalanceRecommendation[] {
    try {
      const recommendations: RebalanceRecommendation[] = [];
      const totalValue = this.calculateTotalValue(portfolio.stocks);

      for (const stock of portfolio.stocks) {
        const currentValue = this.calculateStockValue(stock);
        const currentWeight =
          totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
        const targetWeight = stock.targetWeight || stock.weight;
        const difference = Math.abs(currentWeight - targetWeight);

        // Only recommend rebalancing if difference is significant (> 2%)
        if (difference > 2) {
          const targetValue = (targetWeight / 100) * totalValue;
          const valueDifference = targetValue - currentValue;
          const recommendedShares = Math.round(
            valueDifference / stock.currentPrice,
          );

          recommendations.push({
            stock,
            currentWeight,
            targetWeight,
            difference,
            action: valueDifference > 0 ? "buy" : "sell",
            recommendedShares: Math.abs(recommendedShares),
            estimatedCost: Math.abs(valueDifference),
          });
        }
      }

      this.logger.info("Rebalance recommendations calculated", {
        portfolioId: portfolio.id,
        recommendationsCount: recommendations.length,
      });

      return recommendations.sort((a, b) => b.difference - a.difference);
    } catch (error) {
      this.logger.error(
        "Failed to calculate rebalance recommendations",
        error as Error,
      );
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
      const sharpeRatio = this.calculateSharpeRatio(
        portfolio.totalReturnPercent,
        volatility,
      );
      const maxDrawdown = this.calculateMaxDrawdown(portfolio.stocks);

      return {
        volatility,
        beta,
        sharpeRatio,
        maxDrawdown,
      };
    } catch (error) {
      this.logger.error("Failed to calculate risk metrics", error as Error);
      return {
        volatility: 0,
        beta: 1,
        sharpeRatio: 0,
        maxDrawdown: 0,
      };
    }
  }

  /**
   * Calculate sector allocation
   */
  calculateSectorAllocation(stocks: Stock[]): { [sector: string]: number } {
    const sectorAllocation: { [sector: string]: number } = {};
    const totalValue = this.calculateTotalValue(stocks.filter(s => !s.isCashStock));

    for (const stock of stocks.filter(s => !s.isCashStock)) {
      const sector = stock.sector || "Unknown";
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
    return stocks.reduce(
      (total, stock) => total + this.calculateStockValue(stock),
      0,
    );
  }

  private calculateStockValue(stock: Stock): number {
    return (stock.quantity || stock.shares) * stock.currentPrice;
  }

  /**
   * Add price history entry
   */
  addPriceHistory(stock: Stock, price: number, quantity: number, notes?: string): PriceHistory {
    const historyEntry: PriceHistory = {
      id: this.generateId(),
      stockId: stock.id!,
      price,
      quantity,
      date: new Date(),
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!stock.priceHistory) {
      stock.priceHistory = [];
    }

    stock.priceHistory.push(historyEntry);
    return historyEntry;
  }

  /**
   * Get price history for analysis
   */
  getPriceHistoryAnalysis(stock: Stock): {
    averagePrice: number;
    priceRange: { min: number; max: number };
    priceChange: number;
    priceChangePercent: number;
  } {
    if (!stock.priceHistory || stock.priceHistory.length === 0) {
      return {
        averagePrice: stock.currentPrice,
        priceRange: { min: stock.currentPrice, max: stock.currentPrice },
        priceChange: 0,
        priceChangePercent: 0
      };
    }

    const prices = stock.priceHistory.map(h => h.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const oldestPrice = stock.priceHistory[0].price;
    const priceChange = stock.currentPrice - oldestPrice;
    const priceChangePercent = oldestPrice > 0 ? (priceChange / oldestPrice) * 100 : 0;

    return {
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      priceChange,
      priceChangePercent
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private calculateTotalReturn(stocks: Stock[]): number {
    // Simplified calculation - in reality would use purchase prices vs current prices
    return stocks.reduce((total, stock) => {
      const currentValue = this.calculateStockValue(stock);
      const assumedCost = currentValue * 0.9; // Assume 10% gain for demo
      return total + (currentValue - assumedCost);
    }, 0);
  }

  private calculateReturnPercentage(
    totalValue: number,
    totalReturn: number,
  ): number {
    if (totalValue === 0) return 0;
    const investedAmount = totalValue - totalReturn;
    return investedAmount > 0 ? (totalReturn / investedAmount) * 100 : 0;
  }

  private calculateVolatility(stocks: Stock[]): number {
    // Simplified volatility calculation
    const weights = stocks.map((stock) => stock.weight / 100);
    const volatilities = stocks.map(() => Math.random() * 0.3 + 0.1); // Random demo data

    let portfolioVolatility = 0;
    for (let i = 0; i < stocks.length; i++) {
      portfolioVolatility += weights[i] ** 2 * volatilities[i] ** 2;
    }

    return Math.sqrt(portfolioVolatility) * 100;
  }

  private calculateBeta(stocks: Stock[]): number {
    // Simplified beta calculation
    const weights = stocks.map((stock) => stock.weight / 100);
    const betas = stocks.map(() => Math.random() * 1.5 + 0.5); // Random demo data

    return weights.reduce(
      (total, weight, index) => total + weight * betas[index],
      0,
    );
  }

  private calculateSharpeRatio(
    returnPercent: number,
    volatility: number,
  ): number {
    const riskFreeRate = 6; // Assume 6% risk-free rate
    return volatility > 0 ? (returnPercent - riskFreeRate) / volatility : 0;
  }

  private calculateMaxDrawdown(stocks: Stock[]): number {
    // Simplified max drawdown calculation
    return Math.random() * 20 + 5; // Random demo data between 5-25%
  }

  /**
   * Create cash stock for portfolio
   */
  createCashStock(portfolioId: string, cashAmount: number): Stock {
    return {
      id: this.generateId(),
      ticker: 'CASH',
      name: 'Cash',
      exchange: 'N/A',
      sector: 'Cash',
      weight: 0,
      shares: cashAmount,
      quantity: cashAmount,
      currentPrice: 1,
      totalValue: cashAmount,
      notes: [],
      priceHistory: [],
      isCashStock: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
