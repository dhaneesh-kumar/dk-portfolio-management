import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";

import {
  Portfolio,
  CreatePortfolioDto,
  UpdatePortfolioDto,
  AddStockDto,
  UpdateStockDto,
  PortfolioPerformance,
  RebalanceRecommendation,
} from "../models/portfolio.model";
import { LoggerService } from "../../../core/services/logger.service";
import { AuthService } from "../../../core/services/auth.service";

@Injectable()
export class PortfolioDataService {
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);

  /**
   * Get all portfolios for the current user
   */
  async getAllPortfolios(): Promise<Portfolio[]> {
    try {
      const user = this.authService.user();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // For now, return sample data
      // In a real app, this would call Firebase/API
      return this.getSamplePortfolios();
    } catch (error) {
      this.logger.error("Failed to fetch portfolios", error as Error);
      throw error;
    }
  }

  /**
   * Get portfolio by ID
   */
  async getPortfolioById(id: string): Promise<Portfolio | null> {
    try {
      const portfolios = await this.getAllPortfolios();
      return portfolios.find((p) => p.id === id) || null;
    } catch (error) {
      this.logger.error("Failed to fetch portfolio", error as Error, {
        portfolioId: id,
      });
      throw error;
    }
  }

  /**
   * Create new portfolio
   */
  async createPortfolio(
    data: CreatePortfolioDto & { ownerId: string; ownerEmail: string },
  ): Promise<Portfolio> {
    try {
      // Simulate API call
      const newPortfolio: Portfolio = {
        id: this.generateId(),
        name: data.name,
        description: data.description,
        type: data.type,
        stocks: [],
        totalValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.info("Portfolio created", {
        portfolioId: newPortfolio.id,
        name: data.name,
      });
      return newPortfolio;
    } catch (error) {
      this.logger.error("Failed to create portfolio", error as Error);
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(data: UpdatePortfolioDto): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Portfolio updated", { portfolioId: data.id });
      return true;
    } catch (error) {
      this.logger.error("Failed to update portfolio", error as Error);
      throw error;
    }
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(id: string): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Portfolio deleted", { portfolioId: id });
      return true;
    } catch (error) {
      this.logger.error("Failed to delete portfolio", error as Error);
      throw error;
    }
  }

  /**
   * Add stock to portfolio
   */
  async addStockToPortfolio(data: AddStockDto): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Stock added to portfolio", {
        portfolioId: data.portfolioId,
        ticker: data.ticker,
      });
      return true;
    } catch (error) {
      this.logger.error("Failed to add stock", error as Error);
      throw error;
    }
  }

  /**
   * Update stock in portfolio
   */
  async updateStock(data: UpdateStockDto): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Stock updated", {
        portfolioId: data.portfolioId,
        stockId: data.stockId,
      });
      return true;
    } catch (error) {
      this.logger.error("Failed to update stock", error as Error);
      throw error;
    }
  }

  /**
   * Remove stock from portfolio
   */
  async removeStockFromPortfolio(
    portfolioId: string,
    stockId: string,
  ): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Stock removed from portfolio", {
        portfolioId,
        stockId,
      });
      return true;
    } catch (error) {
      this.logger.error("Failed to remove stock", error as Error);
      throw error;
    }
  }

  /**
   * Execute portfolio rebalancing
   */
  async executeRebalance(
    portfolioId: string,
    recommendations: RebalanceRecommendation[],
  ): Promise<boolean> {
    try {
      // Simulate API call
      this.logger.info("Portfolio rebalanced", {
        portfolioId,
        recommendationsCount: recommendations.length,
      });
      return true;
    } catch (error) {
      this.logger.error("Failed to execute rebalance", error as Error);
      throw error;
    }
  }

  /**
   * Get portfolio performance history
   */
  getPortfolioPerformance(
    portfolioId: string,
    days: number,
  ): Observable<PortfolioPerformance[]> {
    // Simulate API call with sample data
    const performance: PortfolioPerformance[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      performance.push({
        id: this.generateId(),
        portfolioId,
        date,
        value: 100000 + Math.random() * 50000,
        return: Math.random() * 1000,
        returnPercent: Math.random() * 10,
        createdAt: date,
        updatedAt: date,
      });
    }

    return of(performance);
  }

  /**
   * Generate sample portfolios for development
   */
  private getSamplePortfolios(): Portfolio[] {
    const user = this.authService.user();
    if (!user) return [];

    return [
      {
        id: "portfolio-1",
        name: "Growth Portfolio",
        description: "High growth potential stocks",
        type: "equity",
        stocks: [
          {
            id: "stock-1",
            ticker: "RELIANCE",
            name: "Reliance Industries Limited",
            exchange: "NSE",
            weight: 25,
            shares: 100,
            currentPrice: 2450,
            totalValue: 245000,
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "stock-2",
            ticker: "TCS",
            name: "Tata Consultancy Services",
            exchange: "NSE",
            weight: 20,
            shares: 50,
            currentPrice: 3520,
            totalValue: 176000,
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        totalValue: 421000,
        totalReturn: 35000,
        totalReturnPercent: 8.3,
        ownerId: user.uid,
        ownerEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "portfolio-2",
        name: "Balanced Portfolio",
        description: "Mix of growth and value stocks",
        type: "hybrid",
        stocks: [
          {
            id: "stock-3",
            ticker: "HDFCBANK",
            name: "HDFC Bank Limited",
            exchange: "NSE",
            weight: 30,
            shares: 150,
            currentPrice: 1680,
            totalValue: 252000,
            notes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        totalValue: 252000,
        totalReturn: 18000,
        totalReturnPercent: 7.1,
        ownerId: user.uid,
        ownerEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
