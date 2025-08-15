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

      // Return empty array - using Firebase service instead
      return [];
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
        budget: 0,
        maxStocks: 0,
        maxStockAllocationPercent: 0,
        availableCash: 0
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
    // Return empty array - using Firebase service instead
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


  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
