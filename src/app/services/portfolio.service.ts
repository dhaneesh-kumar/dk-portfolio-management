import { Injectable, signal } from "@angular/core";
import {
  Portfolio,
  Stock,
  MarketData,
  StockNote,
} from "../models/portfolio.model";

@Injectable({
  providedIn: "root",
})
export class PortfolioService {
  private portfolios = signal<Portfolio[]>([]);

  constructor() {
    this.initializeSampleData();
  }

  getPortfolios() {
    return this.portfolios.asReadonly();
  }

  getPortfolio(id: string): Portfolio | undefined {
    return this.portfolios().find((p) => p.id === id);
  }

  createPortfolio(name: string, description: string): Portfolio {
    const portfolio: Portfolio = {
      id: this.generateId(),
      name,
      ownerId: 'sample-user',
      ownerEmail: 'sample@example.com',
      description,
      stocks: [],
      totalValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.portfolios.update((portfolios) => [...portfolios, portfolio]);
    return portfolio;
  }

  updatePortfolio(updatedPortfolio: Portfolio): void {
    this.portfolios.update((portfolios) =>
      portfolios.map((p) =>
        p.id === updatedPortfolio.id ? updatedPortfolio : p,
      ),
    );
  }

  deletePortfolio(id: string): void {
    this.portfolios.update((portfolios) =>
      portfolios.filter((p) => p.id !== id),
    );
  }

  addStockToPortfolio(
    portfolioId: string,
    stock: Omit<Stock, "id" | "notes" | "totalValue">,
  ): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    const newStock: Stock = {
      ...stock,
      id: this.generateId(),
      notes: [],
      totalValue: stock.shares * stock.currentPrice,
    };

    portfolio.stocks.push(newStock);
    this.calculatePortfolioTotals(portfolio);
    this.updatePortfolio(portfolio);
  }

  removeStockFromPortfolio(portfolioId: string, stockId: string): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    portfolio.stocks = portfolio.stocks.filter((s) => s.id !== stockId);
    this.calculatePortfolioTotals(portfolio);
    this.updatePortfolio(portfolio);
  }

  updateStockWeight(
    portfolioId: string,
    stockId: string,
    weight: number,
  ): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return;

    stock.weight = weight;
    this.updatePortfolio(portfolio);
  }

  rebalancePortfolio(portfolioId: string): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    const totalValue = portfolio.totalValue;

    portfolio.stocks.forEach((stock) => {
      const targetValue = (stock.weight / 100) * totalValue;
      stock.shares = Math.floor(targetValue / stock.currentPrice);
      stock.totalValue = stock.shares * stock.currentPrice;
    });

    this.calculatePortfolioTotals(portfolio);
    this.updatePortfolio(portfolio);
  }

  addStockNote(
    portfolioId: string,
    stockId: string,
    section: string,
    content: string,
  ): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return;

    const note: StockNote = {
      id: this.generateId(),
      section,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    stock.notes.push(note);
    this.updatePortfolio(portfolio);
  }

  updateStockNote(
    portfolioId: string,
    stockId: string,
    noteId: string,
    content: string,
  ): void {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return;

    const note = stock.notes.find((n) => n.id === noteId);
    if (!note) return;

    note.content = content;
    note.updatedAt = new Date();
    this.updatePortfolio(portfolio);
  }

  private calculatePortfolioTotals(portfolio: Portfolio): void {
    portfolio.totalValue = portfolio.stocks.reduce(
      (sum, stock) => sum + stock.totalValue,
      0,
    );
    // Mock calculation for returns - in real app would compare to initial investment
    portfolio.totalReturn = portfolio.totalValue * 0.08; // 8% mock return
    portfolio.totalReturnPercent = 8.0;
    portfolio.updatedAt = new Date();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeSampleData(): void {
    const nifty50: Portfolio = {
      id: "nifty50",
      name: "Nifty 50",
      description: "Top 50 Indian stocks by market cap",
      ownerId: 'sample-user',
      ownerEmail: 'sample@example.com',
      stocks: [
        {
          id: "reliance",
          ticker: "RELIANCE",
          name: "Reliance Industries Ltd",
          weight: 10.5,
          shares: 100,
          currentPrice: 2450.5,
          totalValue: 245050,
          notes: [],
          marketData: {
            price: 2450.5,
            change: 24.3,
            changePercent: 1.0,
            pe: 28.5,
            bookValue: 1250.0,
            eps: 86.0,
            dividendYield: 0.34,
            debt: 2.1,
            marketCap: 16500000,
            volume: 2500000,
            lastUpdated: new Date(),
          },
        },
        {
          id: "tcs",
          ticker: "TCS",
          name: "Tata Consultancy Services",
          weight: 8.2,
          shares: 50,
          currentPrice: 3850.75,
          totalValue: 192537.5,
          notes: [],
          marketData: {
            price: 3850.75,
            change: -15.25,
            changePercent: -0.39,
            pe: 32.1,
            bookValue: 125.5,
            eps: 120.0,
            dividendYield: 1.8,
            debt: 0.1,
            marketCap: 14200000,
            volume: 1800000,
            lastUpdated: new Date(),
          },
        },
        {
          id: "hdfc-bank",
          ticker: "HDFCBANK",
          name: "HDFC Bank Ltd",
          weight: 7.8,
          shares: 150,
          currentPrice: 1685.2,
          totalValue: 252780,
          notes: [],
          marketData: {
            price: 1685.2,
            change: 8.45,
            changePercent: 0.5,
            pe: 18.5,
            bookValue: 450.25,
            eps: 91.2,
            dividendYield: 1.2,
            debt: 12.5,
            marketCap: 12800000,
            volume: 3200000,
            lastUpdated: new Date(),
          },
        },
      ],
      totalValue: 690367.5,
      totalReturn: 55229.4,
      totalReturnPercent: 8.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: true,
    };

    const sensex30: Portfolio = {
      id: "sensex30",
      name: "Sensex 30",
      description: "BSE Sensex top 30 companies",
      ownerId: 'sample-user',
      ownerEmail: 'sample@example.com',
      stocks: [
        {
          id: "sensex-reliance",
          ticker: "RELIANCE",
          name: "Reliance Industries Ltd",
          weight: 12.0,
          shares: 80,
          currentPrice: 2450.5,
          totalValue: 196040,
          notes: [],
          marketData: {
            price: 2450.5,
            change: 24.3,
            changePercent: 1.0,
            pe: 28.5,
            bookValue: 1250.0,
            eps: 86.0,
            dividendYield: 0.34,
            debt: 2.1,
            marketCap: 16500000,
            volume: 2500000,
            lastUpdated: new Date(),
          },
        },
        {
          id: "sensex-infosys",
          ticker: "INFY",
          name: "Infosys Ltd",
          weight: 8.5,
          shares: 120,
          currentPrice: 1542.8,
          totalValue: 185136,
          notes: [],
          marketData: {
            price: 1542.8,
            change: -12.2,
            changePercent: -0.78,
            pe: 28.2,
            bookValue: 285.6,
            eps: 54.7,
            dividendYield: 2.1,
            debt: 0.05,
            marketCap: 6350000,
            volume: 4100000,
            lastUpdated: new Date(),
          },
        },
      ],
      totalValue: 381176,
      totalReturn: 30494.08,
      totalReturnPercent: 8.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: true,
    };

    this.portfolios.set([nifty50, sensex30]);
  }
}
