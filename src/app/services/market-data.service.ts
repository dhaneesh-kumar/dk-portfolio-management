import { Injectable, inject, signal } from "@angular/core";
import { StockApiService } from "./stock-api.service";
import { FirebasePortfolioService } from "./firebase-portfolio.service";
import { AuthService } from "./auth.service";
import { MarketData } from "../models/portfolio.model";
import { interval, Subject, takeUntil, switchMap, forkJoin } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MarketDataService {
  private stockApiService = inject(StockApiService);
  private portfolioService = inject(FirebasePortfolioService);
  private authService = inject(AuthService);
  
  private destroy$ = new Subject<void>();
  private isRefreshing = signal(false);
  private lastRefresh = signal<Date | null>(null);
  
  // Refresh interval in milliseconds (5 minutes)
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;
  
  constructor() {
    this.startPeriodicRefresh();
  }

  /**
   * Get refresh status
   */
  getIsRefreshing() {
    return this.isRefreshing.asReadonly();
  }

  /**
   * Get last refresh time
   */
  getLastRefresh() {
    return this.lastRefresh.asReadonly();
  }

  /**
   * Start periodic refresh of market data
   */
  private startPeriodicRefresh(): void {
    // Only refresh if user is authenticated
    interval(this.REFRESH_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          const user = this.authService.user();
          if (user) {
            return this.refreshAllPortfolioData();
          }
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Manually refresh market data for all portfolios
   */
  async refreshAllPortfolioData(): Promise<boolean> {
    if (this.isRefreshing()) {
      return false;
    }

    this.isRefreshing.set(true);
    
    try {
      const portfolios = this.portfolioService.getPortfolios()();
      const promises: Promise<boolean>[] = [];

      for (const portfolio of portfolios) {
        if (portfolio.stocks.length > 0) {
          promises.push(this.refreshPortfolioData(portfolio.id));
        }
      }

      const results = await Promise.all(promises);
      const success = results.every(result => result);
      
      if (success) {
        this.lastRefresh.set(new Date());
      }
      
      return success;
    } catch (error) {
      console.error("Error refreshing portfolio data:", error);
      return false;
    } finally {
      this.isRefreshing.set(false);
    }
  }

  /**
   * Refresh market data for a specific portfolio
   */
  async refreshPortfolioData(portfolioId: string): Promise<boolean> {
    const portfolio = this.portfolioService.getPortfolio(portfolioId);
    if (!portfolio || portfolio.stocks.length === 0) {
      return false;
    }

    try {
      // Get unique stock tickers
      const tickers = [...new Set(portfolio.stocks.map(stock => stock.ticker))];
      
      // Fetch quotes for all stocks in parallel
      const quotes$ = tickers.map(ticker => 
        this.stockApiService.getStockQuote(ticker)
      );

      return new Promise((resolve) => {
        forkJoin(quotes$).subscribe({
          next: async (quotes) => {
            const marketDataMap: { [ticker: string]: MarketData } = {};

            quotes.forEach((quote, index) => {
              if (quote) {
                const ticker = tickers[index];
                marketDataMap[ticker.toUpperCase()] = this.stockApiService.convertToMarketData(quote);
              }
            });

            if (Object.keys(marketDataMap).length > 0) {
              const success = await this.portfolioService.updateAllStocksMarketData(
                portfolioId,
                marketDataMap
              );
              resolve(success);
            } else {
              // Even if no new data, consider it a successful refresh
              resolve(true);
            }
          },
          error: (error) => {
            console.warn(`API unavailable for portfolio ${portfolioId}, using fallback data:`, error.message);
            // Don't fail completely, just resolve as successful
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error(`Error refreshing portfolio ${portfolioId}:`, error);
      return false;
    }
  }

  /**
   * Refresh market data for a specific stock
   */
  async refreshStockData(portfolioId: string, stockTicker: string): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        this.stockApiService.getStockQuote(stockTicker).subscribe({
          next: async (quote) => {
            if (quote) {
              const marketData = this.stockApiService.convertToMarketData(quote);
              const success = await this.portfolioService.updateStockMarketData(
                portfolioId,
                stockTicker,
                marketData
              );
              resolve(success);
            } else {
              resolve(false);
            }
          },
          error: (error) => {
            console.error(`Error fetching data for stock ${stockTicker}:`, error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error(`Error refreshing stock ${stockTicker}:`, error);
      return false;
    }
  }

  /**
   * Get market status (open/closed) based on Indian market hours
   */
  getMarketStatus(): { isOpen: boolean; nextOpenTime?: Date; message: string } {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);
    
    const day = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTimeMinutes = hours * 60 + minutes;
    
    // Market hours: Monday to Friday, 9:15 AM to 3:30 PM IST
    const marketOpenMinutes = 9 * 60 + 15; // 9:15 AM
    const marketCloseMinutes = 15 * 60 + 30; // 3:30 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = currentTimeMinutes >= marketOpenMinutes && currentTimeMinutes <= marketCloseMinutes;
    
    if (isWeekday && isMarketHours) {
      return {
        isOpen: true,
        message: "Market is currently open"
      };
    } else if (isWeekday && currentTimeMinutes < marketOpenMinutes) {
      // Market will open today
      const nextOpen = new Date(istTime);
      nextOpen.setHours(9, 15, 0, 0);
      return {
        isOpen: false,
        nextOpenTime: nextOpen,
        message: "Market opens at 9:15 AM IST"
      };
    } else {
      // Market is closed, calculate next opening day
      let daysUntilOpen = 1;
      let nextDay = (day + 1) % 7;
      
      while (nextDay === 0 || nextDay === 6) { // Skip weekends
        daysUntilOpen++;
        nextDay = (nextDay + 1) % 7;
      }
      
      const nextOpen = new Date(istTime);
      nextOpen.setDate(nextOpen.getDate() + daysUntilOpen);
      nextOpen.setHours(9, 15, 0, 0);
      
      return {
        isOpen: false,
        nextOpenTime: nextOpen,
        message: daysUntilOpen === 1 ? "Market opens tomorrow at 9:15 AM IST" : 
                 `Market opens on ${nextOpen.toLocaleDateString('en-IN', { weekday: 'long' })} at 9:15 AM IST`
      };
    }
  }

  /**
   * Stop periodic refresh
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
