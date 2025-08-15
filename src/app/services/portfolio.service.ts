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
    // Remove sample data - using database now
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
      ownerId: "sample-user",
      ownerEmail: "sample@example.com",
      description,
      type: "custom",
      stocks: [],
      totalValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      budget: 100000,
      maxStocks: 15,
      maxStockAllocationPercent: 20,
      availableCash: 100000,
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

  // Sample data initialization removed - using database instead
}
