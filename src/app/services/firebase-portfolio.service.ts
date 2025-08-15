import { Injectable, signal, inject } from "@angular/core";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  or,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase.config";
import {
  Portfolio,
  Stock,
  StockNote,
  PortfolioShare,
  SharePermissions,
  PortfolioComment,
  MarketData,
} from "../models/portfolio.model";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class FirebasePortfolioService {
  private authService = inject(AuthService);
  private portfolios = signal<Portfolio[]>([]);
  private loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    // Load portfolios when user authentication state changes
    // Note: In a real app, you'd use effect() or computed() to watch the signal
    this.loadPortfolios();
  }

  getPortfolios() {
    return this.portfolios.asReadonly();
  }

  getLoading() {
    return this.loading.asReadonly();
  }

  getError() {
    return this.error.asReadonly();
  }

  // Add computed properties for compatibility
  isLoading() {
    return this.loading();
  }

  totalPortfolioValue() {
    return this.portfolios().reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  }

  averageReturn() {
    const portfolios = this.portfolios();
    if (portfolios.length === 0) return 0;

    const totalReturn = portfolios.reduce((sum, p) => sum + p.totalReturnPercent, 0);
    return totalReturn / portfolios.length;
  }

  async loadPortfolios(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const user = this.authService.user();
      if (!user) {
        this.portfolios.set([]);
        return;
      }

      // Check if Firebase is configured
      if (!db) {
        this.error.set("Firebase not configured. Please set up Firebase to store data.");
        return;
      }

      // Load portfolios owned by the user
      const ownedQuery = query(
        collection(db, "portfolios"),
        where("ownerId", "==", user.uid),
      );
      const ownedSnapshot = await getDocs(ownedQuery);

      // Load shared portfolios
      const sharedQuery = query(
        collection(db, "portfolio_shares"),
        where("sharedWithEmail", "==", user.email),
      );
      const sharedSnapshot = await getDocs(sharedQuery);

      const portfolios: Portfolio[] = [];

      // Add owned portfolios
      ownedSnapshot.forEach((doc) => {
        const data = doc.data();
        portfolios.push(this.convertFirestoreToPortfolio(doc.id, data));
      });

      // Add shared portfolios
      for (const shareDoc of sharedSnapshot.docs) {
        const shareData = shareDoc.data();
        const portfolioDoc = await getDoc(
          doc(db, "portfolios", shareData["portfolioId"]),
        );
        if (portfolioDoc.exists()) {
          const portfolioData = portfolioDoc.data();
          const portfolio = this.convertFirestoreToPortfolio(
            portfolioDoc.id,
            portfolioData,
          );
          portfolio.isShared = true;
          portfolio.shareId = shareDoc.id;
          portfolio.permissions = shareData["permissions"];
          portfolios.push(portfolio);
        }
      }

      // Sort portfolios by creation date (newest first) - client-side sorting
      portfolios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this.portfolios.set(portfolios);
    } catch (err) {
      console.error("Error loading portfolios:", err);
      this.error.set(
        "Failed to load portfolios. Please check your Firebase configuration.",
      );
      // Firebase configuration needed to store data
    } finally {
      this.loading.set(false);
    }
  }

  getPortfolio(id: string): Portfolio | undefined {
    return this.portfolios().find((p) => p.id === id);
  }

  async createPortfolio(
    name: string,
    description: string,
    budget: number = 100000,
    maxStocks: number = 15,
    maxStockAllocationPercent: number = 20
  ): Promise<Portfolio | null> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if Firebase is configured
      if (!db) {
        this.error.set("Firebase not configured. Cannot save data.");
        return null;
      }

      const user = this.authService.user();
      if (!user) return null;

      const portfolioData = {
        name,
        description,
        type: 'custom' as const,
        stocks: [],
        totalValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        // Enhanced fields for manual management
        budget: budget,
        maxStocks: maxStocks,
        maxStockAllocationPercent: maxStockAllocationPercent,
        availableCash: budget, // Initial cash = budget
        ownerId: user.uid,
        ownerEmail: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isTemplate: false,
        comments: [],
      };

      const docRef = await addDoc(collection(db, "portfolios"), portfolioData);

      const newPortfolio: Portfolio = {
        id: docRef.id,
        ...portfolioData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.portfolios.update((portfolios) => [newPortfolio, ...portfolios]);
      return newPortfolio;
    } catch (err) {
      console.error("Error creating portfolio:", err);
      this.error.set("Failed to create portfolio");
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async updatePortfolio(updatedPortfolio: Portfolio): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if Firebase is configured
      if (!db) {
        this.error.set("Firebase not configured. Cannot save data.");
        return false;
      }

      const portfolioRef = doc(db, "portfolios", updatedPortfolio.id);
      const updateData = {
        ...updatedPortfolio,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.fromDate(
          (updatedPortfolio.createdAt as any).toDate
            ? (updatedPortfolio.createdAt as any).toDate()
            : updatedPortfolio.createdAt,
        ),
        stocks: updatedPortfolio.stocks.map((stock) => {
          const stockData: any = {
            ...stock,
            notes: stock.notes.map((note) => ({
              ...note,
              createdAt: Timestamp.fromDate(
                (note.createdAt as any).toDate
                  ? (note.createdAt as any).toDate()
                  : note.createdAt,
              ),
              updatedAt: Timestamp.fromDate(
                (note.updatedAt as any).toDate
                  ? (note.updatedAt as any).toDate()
                  : note.updatedAt,
              ),
            })),
          };
          if (stockData.marketData && stockData.marketData.lastUpdated) {
            stockData.marketData.lastUpdated = Timestamp.fromDate(
              (stockData.marketData.lastUpdated as any).toDate
                ? (stockData.marketData.lastUpdated as any).toDate()
                : stockData.marketData.lastUpdated,
            );
          }
          return stockData;
        }),
      };

      await updateDoc(portfolioRef, updateData);

      console.log('updatePortfolio - updating local portfolios signal');
      this.portfolios.update((portfolios) => {
        const newPortfolios = portfolios.map((p) =>
          p.id === updatedPortfolio.id
            ? {
                ...updatedPortfolio,
                updatedAt: new Date(),
              }
            : p,
        );
        console.log('updatePortfolio - portfolios updated, total:', newPortfolios.length);
        return newPortfolios;
      });

      return true;
    } catch (err) {
      console.error("Error updating portfolio:", err);
      this.error.set("Failed to update portfolio");
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async deletePortfolio(id: string): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if Firebase is configured
      if (!db) {
        this.error.set("Firebase not configured. Cannot delete data.");
        return false;
      }

      await deleteDoc(doc(db, "portfolios", id));
      this.portfolios.update((portfolios) =>
        portfolios.filter((p) => p.id !== id),
      );

      return true;
    } catch (err) {
      console.error("Error deleting portfolio:", err);
      this.error.set("Failed to delete portfolio");
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async addStockToPortfolio(
    portfolioId: string,
    stock: Omit<Stock, "id" | "notes" | "totalValue">,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const newStock: Stock = {
      ...stock,
      id: this.generateId(),
      notes: [],
      totalValue: stock.shares * stock.currentPrice,
    };

    portfolio.stocks.push(newStock);
    this.calculatePortfolioTotals(portfolio);

    return await this.updatePortfolio(portfolio);
  }

  async removeStockFromPortfolio(
    portfolioId: string,
    stockId: string,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    portfolio.stocks = portfolio.stocks.filter((s) => s.id !== stockId);
    this.calculatePortfolioTotals(portfolio);

    return await this.updatePortfolio(portfolio);
  }

  async updateStockWeight(
    portfolioId: string,
    stockId: string,
    weight: number,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return false;

    stock.weight = weight;
    return await this.updatePortfolio(portfolio);
  }

  async rebalancePortfolio(portfolioId: string): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const totalValue = portfolio.totalValue;

    portfolio.stocks.forEach((stock) => {
      const targetValue = (stock.weight / 100) * totalValue;
      stock.shares = Math.floor(targetValue / stock.currentPrice);
      stock.totalValue = stock.shares * stock.currentPrice;
    });

    this.calculatePortfolioTotals(portfolio);
    return await this.updatePortfolio(portfolio);
  }

  async addStockNote(
    portfolioId: string,
    stockId: string,
    section: string,
    content: string,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return false;

    const note: StockNote = {
      id: this.generateId(),
      section,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create a new portfolio object to trigger reactivity
    const updatedPortfolio = {
      ...portfolio,
      stocks: portfolio.stocks.map(s =>
        s.id === stockId
          ? {
              ...s,
              notes: [...s.notes, note]
            }
          : s
      )
    };

    return await this.updatePortfolio(updatedPortfolio);
  }

  async updateStockNote(
    portfolioId: string,
    stockId: string,
    noteId: string,
    content: string,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find((s) => s.id === stockId);
    if (!stock) return false;

    const note = stock.notes.find((n) => n.id === noteId);
    if (!note) return false;

    note.content = content;
    note.updatedAt = new Date();

    return await this.updatePortfolio(portfolio);
  }

  async updateStockMarketData(
    portfolioId: string,
    stockTicker: string,
    marketData: MarketData,
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find(
      (s) => s.ticker.toUpperCase() === stockTicker.toUpperCase(),
    );
    if (!stock) return false;

    // Update market data
    stock.marketData = marketData;

    // Update current price and total value if market data has price
    if (marketData.price > 0) {
      stock.currentPrice = marketData.price;
      stock.totalValue = stock.shares * stock.currentPrice;
    }

    // Recalculate portfolio totals
    this.calculatePortfolioTotals(portfolio);

    return await this.updatePortfolio(portfolio);
  }

  async updateAllStocksMarketData(
    portfolioId: string,
    marketDataMap: { [ticker: string]: MarketData },
  ): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    let updated = false;
    for (const stock of portfolio.stocks) {
      const marketData = marketDataMap[stock.ticker.toUpperCase()];
      if (marketData) {
        stock.marketData = marketData;
        if (marketData.price > 0) {
          stock.currentPrice = marketData.price;
          stock.totalValue = stock.shares * stock.currentPrice;
        }
        updated = true;
      }
    }

    if (updated) {
      this.calculatePortfolioTotals(portfolio);
      return await this.updatePortfolio(portfolio);
    }

    return false;
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

  // Sample data removed - all data now comes from Firebase database

  private convertFirestoreToPortfolio(id: string, data: any): Portfolio {
    return {
      id,
      ...data,
      createdAt: data["createdAt"]?.toDate() || new Date(),
      updatedAt: data["updatedAt"]?.toDate() || new Date(),
      stocks:
        data["stocks"]?.map((stock: any) => ({
          ...stock,
          notes:
            stock.notes?.map((note: any) => ({
              ...note,
              createdAt: note.createdAt?.toDate() || new Date(),
              updatedAt: note.updatedAt?.toDate() || new Date(),
            })) || [],
        })) || [],
      comments:
        data["comments"]?.map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt?.toDate() || new Date(),
          updatedAt: comment.updatedAt?.toDate() || new Date(),
        })) || [],
    } as Portfolio;
  }

  // Sharing Methods
  async sharePortfolio(
    portfolioId: string,
    email: string,
    permissions: SharePermissions,
    message?: string,
  ): Promise<boolean> {
    try {
      if (!db) return false;

      const user = this.authService.user();
      if (!user) return false;

      const shareData = {
        portfolioId,
        sharedWithEmail: email,
        sharedById: user.uid,
        sharedByEmail: user.email,
        permissions,
        message: message || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "portfolio_shares"), shareData);
      console.log("✅ Portfolio shared successfully");
      return true;
    } catch (error) {
      console.error("❌ Error sharing portfolio:", error);
      return false;
    }
  }

  async getPortfolioShares(portfolioId: string): Promise<PortfolioShare[]> {
    try {
      if (!db) return [];

      const q = query(
        collection(db, "portfolio_shares"),
        where("portfolioId", "==", portfolioId),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()["createdAt"]?.toDate() || new Date(),
        updatedAt: doc.data()["updatedAt"]?.toDate() || new Date(),
      })) as PortfolioShare[];
    } catch (error) {
      console.error("Error loading portfolio shares:", error);
      return [];
    }
  }

  async removePortfolioShare(shareId: string): Promise<boolean> {
    try {
      if (!db) return false;

      await deleteDoc(doc(db, "portfolio_shares", shareId));
      console.log("✅ Portfolio share removed successfully");
      return true;
    } catch (error) {
      console.error("�� Error removing portfolio share:", error);
      return false;
    }
  }

  // Comments Methods
  async addPortfolioComment(
    portfolioId: string,
    content: string,
  ): Promise<boolean> {
    try {
      if (!db) return false;

      const user = this.authService.user();
      if (!user) return false;

      const commentData = {
        portfolioId,
        content,
        authorId: user.uid,
        authorEmail: user.email,
        authorName: user.displayName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "portfolio_comments"), commentData);

      // Reload portfolios to include the new comment
      await this.loadPortfolios();

      console.log("✅ Comment added successfully");
      return true;
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      return false;
    }
  }

  async getPortfolioComments(portfolioId: string): Promise<PortfolioComment[]> {
    try {
      if (!db) return [];

      const q = query(
        collection(db, "portfolio_comments"),
        where("portfolioId", "==", portfolioId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()["createdAt"]?.toDate() || new Date(),
        updatedAt: doc.data()["updatedAt"]?.toDate() || new Date(),
      })) as PortfolioComment[];
    } catch (error) {
      console.error("Error loading comments:", error);
      return [];
    }
  }

  // Check permissions for shared portfolios
  canEditPortfolio(portfolio: Portfolio): boolean {
    if (!portfolio.isShared) return true;
    return portfolio.permissions?.canEdit || false;
  }

  canEditStocks(portfolio: Portfolio): boolean {
    if (!portfolio.isShared) return true;
    return portfolio.permissions?.canEditStocks || false;
  }

  canEditWeights(portfolio: Portfolio): boolean {
    if (!portfolio.isShared) return true;
    return portfolio.permissions?.canEditWeights || false;
  }

  canAddNotes(portfolio: Portfolio): boolean {
    if (!portfolio.isShared) return true;
    return portfolio.permissions?.canAddNotes || false;
  }

  canComment(portfolio: Portfolio): boolean {
    if (!portfolio.isShared) return true;
    return portfolio.permissions?.canComment || false;
  }
}
