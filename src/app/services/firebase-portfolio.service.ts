import { Injectable, signal } from '@angular/core';
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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Portfolio, Stock, StockNote } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class FirebasePortfolioService {
  private portfolios = signal<Portfolio[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor() {
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

  async loadPortfolios(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if Firebase is configured
      if (!db) {
        this.error.set('Firebase not configured. Using sample data.');
        this.initializeSampleData();
        return;
      }

      const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const portfolios: Portfolio[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        portfolios.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          stocks: data.stocks?.map((stock: any) => ({
            ...stock,
            notes: stock.notes?.map((note: any) => ({
              ...note,
              createdAt: note.createdAt?.toDate() || new Date(),
              updatedAt: note.updatedAt?.toDate() || new Date()
            })) || []
          })) || []
        } as Portfolio);
      });

      this.portfolios.set(portfolios);
    } catch (err) {
      console.error('Error loading portfolios:', err);
      this.error.set('Failed to load portfolios. Please check your Firebase configuration.');
      // Fallback to sample data if Firebase fails
      this.initializeSampleData();
    } finally {
      this.loading.set(false);
    }
  }

  getPortfolio(id: string): Portfolio | undefined {
    return this.portfolios().find(p => p.id === id);
  }

  async createPortfolio(name: string, description: string): Promise<Portfolio | null> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if Firebase is configured
      if (!db) {
        this.error.set('Firebase not configured. Cannot save data.');
        return null;
      }

      const portfolioData = {
        name,
        description,
        stocks: [],
        totalValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isTemplate: false
      };

      const docRef = await addDoc(collection(db, 'portfolios'), portfolioData);
      
      const newPortfolio: Portfolio = {
        id: docRef.id,
        ...portfolioData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.portfolios.update(portfolios => [newPortfolio, ...portfolios]);
      return newPortfolio;
    } catch (err) {
      console.error('Error creating portfolio:', err);
      this.error.set('Failed to create portfolio');
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
        this.error.set('Firebase not configured. Cannot save data.');
        return false;
      }

      const portfolioRef = doc(db, 'portfolios', updatedPortfolio.id);
      const updateData = {
        ...updatedPortfolio,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.fromDate(updatedPortfolio.createdAt),
        stocks: updatedPortfolio.stocks.map(stock => ({
          ...stock,
          notes: stock.notes.map(note => ({
            ...note,
            createdAt: Timestamp.fromDate(note.createdAt),
            updatedAt: Timestamp.fromDate(note.updatedAt)
          }))
        }))
      };

      await updateDoc(portfolioRef, updateData);
      
      this.portfolios.update(portfolios => 
        portfolios.map(p => p.id === updatedPortfolio.id ? {
          ...updatedPortfolio,
          updatedAt: new Date()
        } : p)
      );
      
      return true;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      this.error.set('Failed to update portfolio');
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
        this.error.set('Firebase not configured. Cannot delete data.');
        return false;
      }

      await deleteDoc(doc(db, 'portfolios', id));
      this.portfolios.update(portfolios => portfolios.filter(p => p.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      this.error.set('Failed to delete portfolio');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async addStockToPortfolio(portfolioId: string, stock: Omit<Stock, 'id' | 'notes' | 'totalValue'>): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const newStock: Stock = {
      ...stock,
      id: this.generateId(),
      notes: [],
      totalValue: stock.shares * stock.currentPrice
    };

    portfolio.stocks.push(newStock);
    this.calculatePortfolioTotals(portfolio);
    
    return await this.updatePortfolio(portfolio);
  }

  async removeStockFromPortfolio(portfolioId: string, stockId: string): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    portfolio.stocks = portfolio.stocks.filter(s => s.id !== stockId);
    this.calculatePortfolioTotals(portfolio);
    
    return await this.updatePortfolio(portfolio);
  }

  async updateStockWeight(portfolioId: string, stockId: string, weight: number): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find(s => s.id === stockId);
    if (!stock) return false;

    stock.weight = weight;
    return await this.updatePortfolio(portfolio);
  }

  async rebalancePortfolio(portfolioId: string): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const totalValue = portfolio.totalValue;
    
    portfolio.stocks.forEach(stock => {
      const targetValue = (stock.weight / 100) * totalValue;
      stock.shares = Math.floor(targetValue / stock.currentPrice);
      stock.totalValue = stock.shares * stock.currentPrice;
    });

    this.calculatePortfolioTotals(portfolio);
    return await this.updatePortfolio(portfolio);
  }

  async addStockNote(portfolioId: string, stockId: string, section: string, content: string): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find(s => s.id === stockId);
    if (!stock) return false;

    const note: StockNote = {
      id: this.generateId(),
      section,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    stock.notes.push(note);
    return await this.updatePortfolio(portfolio);
  }

  async updateStockNote(portfolioId: string, stockId: string, noteId: string, content: string): Promise<boolean> {
    const portfolio = this.getPortfolio(portfolioId);
    if (!portfolio) return false;

    const stock = portfolio.stocks.find(s => s.id === stockId);
    if (!stock) return false;

    const note = stock.notes.find(n => n.id === noteId);
    if (!note) return false;

    note.content = content;
    note.updatedAt = new Date();
    
    return await this.updatePortfolio(portfolio);
  }

  private calculatePortfolioTotals(portfolio: Portfolio): void {
    portfolio.totalValue = portfolio.stocks.reduce((sum, stock) => sum + stock.totalValue, 0);
    // Mock calculation for returns - in real app would compare to initial investment
    portfolio.totalReturn = portfolio.totalValue * 0.08; // 8% mock return
    portfolio.totalReturnPercent = 8.0;
    portfolio.updatedAt = new Date();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeSampleData(): void {
    // Fallback sample data when Firebase is not available
    const nifty50: Portfolio = {
      id: 'nifty50',
      name: 'Nifty 50',
      description: 'Top 50 Indian stocks by market cap',
      stocks: [
        {
          id: 'reliance',
          ticker: 'RELIANCE',
          name: 'Reliance Industries Ltd',
          weight: 10.5,
          shares: 100,
          currentPrice: 2450.50,
          totalValue: 245050,
          notes: [],
          marketData: {
            price: 2450.50,
            change: 24.30,
            changePercent: 1.00,
            pe: 28.5,
            bookValue: 1250.00,
            eps: 86.0,
            dividendYield: 0.34,
            debt: 2.1,
            marketCap: 16500000,
            volume: 2500000,
            lastUpdated: new Date()
          }
        },
        {
          id: 'tcs',
          ticker: 'TCS',
          name: 'Tata Consultancy Services',
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
            bookValue: 125.50,
            eps: 120.0,
            dividendYield: 1.8,
            debt: 0.1,
            marketCap: 14200000,
            volume: 1800000,
            lastUpdated: new Date()
          }
        }
      ],
      totalValue: 437587.5,
      totalReturn: 35006.6,
      totalReturnPercent: 8.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: true
    };

    this.portfolios.set([nifty50]);
  }
}
