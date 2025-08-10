import { Injectable } from "@angular/core";
import { Observable, of, forkJoin } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { MarketData } from "../models/portfolio.model";

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  pe?: number;
  eps?: number;
  bookValue?: number;
  dividendYield?: number;
  debt?: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: "root",
})
export class StockApiService {
  private readonly ALPHA_VANTAGE_API_KEY = "demo"; // Replace with actual API key
  private readonly ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";
  
  // For Indian stocks, we'll use a combination of APIs
  private readonly YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v8/finance/chart";
  private readonly YAHOO_SEARCH_API = "https://query2.finance.yahoo.com/v1/finance/search";

  /**
   * Search for stocks by symbol or company name
   */
  searchStocks(query: string): Observable<StockSearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Use Yahoo Finance search API
    const url = `${this.YAHOO_SEARCH_API}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    
    return this.makeHttpRequest<any>(url).pipe(
      map((response) => {
        if (response && response.quotes) {
          return response.quotes
            .filter((quote: any) => quote.typeDisp === "Equity")
            .map((quote: any) => ({
              symbol: quote.symbol,
              name: quote.longname || quote.shortname || quote.symbol,
              exchange: quote.exchange || "NSE",
              currency: "INR",
              type: "Stock",
            }))
            .slice(0, 10);
        }
        return [];
      }),
      catchError((error) => {
        console.error("Stock search error:", error);
        return of(this.getFallbackSearchResults(query));
      }),
    );
  }

  /**
   * Get real-time stock quote and market data
   */
  getStockQuote(symbol: string): Observable<StockQuote | null> {
    // For Indian stocks, append .NS or .BO if not already present
    const formattedSymbol = this.formatIndianSymbol(symbol);
    
    const url = `${this.YAHOO_FINANCE_API}/${formattedSymbol}`;
    
    return this.makeHttpRequest<any>(url).pipe(
      map((response) => {
        if (response && response.chart && response.chart.result && response.chart.result[0]) {
          const result = response.chart.result[0];
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0];
          
          if (meta && quote) {
            return {
              symbol: symbol.toUpperCase(),
              name: meta.longName || meta.shortName || symbol,
              price: meta.regularMarketPrice || meta.previousClose || 0,
              change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
              changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
              marketCap: meta.marketCap,
              volume: meta.regularMarketVolume,
              pe: meta.trailingPE,
              eps: meta.epsTrailingTwelveMonths,
              bookValue: meta.bookValue,
              dividendYield: meta.dividendYield ? meta.dividendYield * 100 : undefined,
              debt: meta.totalDebt,
              lastUpdated: new Date(),
            };
          }
        }
        return null;
      }),
      catchError((error) => {
        console.error("Stock quote error:", error);
        return of(this.getFallbackQuote(symbol));
      }),
    );
  }

  /**
   * Get multiple stock quotes at once
   */
  getMultipleQuotes(symbols: string[]): Observable<(StockQuote | null)[]> {
    const requests = symbols.map(symbol => this.getStockQuote(symbol));
    return forkJoin(requests);
  }

  /**
   * Convert StockQuote to MarketData interface
   */
  convertToMarketData(quote: StockQuote): MarketData {
    return {
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      pe: quote.pe || 0,
      bookValue: quote.bookValue || 0,
      eps: quote.eps || 0,
      dividendYield: quote.dividendYield || 0,
      debt: quote.debt || 0,
      marketCap: quote.marketCap || 0,
      volume: quote.volume || 0,
      lastUpdated: quote.lastUpdated,
    };
  }

  /**
   * Format Indian stock symbols for Yahoo Finance API
   */
  private formatIndianSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    
    // If already has exchange suffix, return as is
    if (upperSymbol.includes('.NS') || upperSymbol.includes('.BO')) {
      return upperSymbol;
    }
    
    // Add NSE suffix for most Indian stocks
    return `${upperSymbol}.NS`;
  }

  /**
   * Make HTTP request with CORS handling
   */
  private makeHttpRequest<T>(url: string): Observable<T> {
    return new Observable(observer => {
      // Using fetch API to handle CORS
      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        observer.next(data);
        observer.complete();
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Fallback search results for common Indian stocks
   */
  private getFallbackSearchResults(query: string): StockSearchResult[] {
    const commonStocks = [
      { symbol: "RELIANCE", name: "Reliance Industries Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "TCS", name: "Tata Consultancy Services Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "HDFCBANK", name: "HDFC Bank Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "INFY", name: "Infosys Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "HINDUNILVR", name: "Hindustan Unilever Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "ICICIBANK", name: "ICICI Bank Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "BHARTIARTL", name: "Bharti Airtel Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "ITC", name: "ITC Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "AXISBANK", name: "Axis Bank Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "LT", name: "Larsen & Toubro Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "SBIN", name: "State Bank of India", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "ASIANPAINT", name: "Asian Paints Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "MARUTI", name: "Maruti Suzuki India Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "NESTLEIND", name: "Nestle India Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "DMART", name: "Avenue Supermarts Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "WIPRO", name: "Wipro Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "HCLTECH", name: "HCL Technologies Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "TITAN", name: "Titan Company Limited", exchange: "NSE", currency: "INR", type: "Stock" },
      { symbol: "POWERGRID", name: "Power Grid Corporation of India Limited", exchange: "NSE", currency: "INR", type: "Stock" },
    ];

    const lowerQuery = query.toLowerCase();
    return commonStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Fallback quote data for when API fails
   */
  private getFallbackQuote(symbol: string): StockQuote {
    const fallbackData: { [key: string]: Partial<StockQuote> } = {
      "RELIANCE": { name: "Reliance Industries Limited", price: 2450, change: 12.5, changePercent: 0.51 },
      "TCS": { name: "Tata Consultancy Services Limited", price: 3520, change: -15.2, changePercent: -0.43 },
      "HDFCBANK": { name: "HDFC Bank Limited", price: 1680, change: 8.3, changePercent: 0.49 },
      "INFY": { name: "Infosys Limited", price: 1420, change: -5.7, changePercent: -0.40 },
      "DMART": { name: "Avenue Supermarts Limited", price: 3850, change: 25.0, changePercent: 0.65 },
    };

    const fallback = fallbackData[symbol.toUpperCase()] || {};
    return {
      symbol: symbol.toUpperCase(),
      name: fallback.name || `${symbol.toUpperCase()} Company`,
      price: fallback.price || 1000,
      change: fallback.change || 0,
      changePercent: fallback.changePercent || 0,
      pe: 15.5,
      eps: 65.0,
      bookValue: 800,
      dividendYield: 1.2,
      debt: 0.3,
      marketCap: 500000000000,
      volume: 1000000,
      lastUpdated: new Date(),
    };
  }
}
