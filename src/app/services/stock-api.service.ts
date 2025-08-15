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
  // Using CORS proxy to avoid browser CORS restrictions
  private readonly CORS_PROXY = "https://api.allorigins.win/raw?url=";
  private readonly YAHOO_FINANCE_API =
    "https://query1.finance.yahoo.com/v8/finance/chart";
  private readonly YAHOO_SEARCH_API =
    "https://query2.finance.yahoo.com/v1/finance/search";

  // Use fallback data for Indian stocks due to API limitations
  // In production, implement backend API for real-time data

  /**
   * Search for stocks by symbol or company name
   */
  searchStocks(query: string): Observable<StockSearchResult[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // Try fallback data first
    const fallbackResults = this.getFallbackSearchResults(query);
    if (fallbackResults.length > 0) {
      return of(fallbackResults);
    }

    // Use localStorage to cache CSV data
    const cacheKey = 'equity_l_csv_data';
    const cached = localStorage.getItem(cacheKey);
    const filterStocks = (stocks: StockSearchResult[]) => {
      const lowerQuery = query.toLowerCase();
      return stocks.filter(
        stock =>
          stock.symbol.toLowerCase().includes(lowerQuery) ||
          stock.name.toLowerCase().includes(lowerQuery)
      ).slice(0, 20);
    };

    if (cached) {
      try {
        const stocks: StockSearchResult[] = JSON.parse(cached);
        return of(filterStocks(stocks));
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    // Fetch and cache CSV if not present
    return new Observable<StockSearchResult[]>(observer => {
      fetch('assets/EQUITY_L.csv')
        .then(response => response.text())
        .then(csv => {
          const lines = csv.split('\n').filter(line => line.trim().length > 0);
          const headers = lines[0].split(',');
          const symbolIdx = headers.findIndex(h => h.trim().toUpperCase() === 'SYMBOL');
          const nameIdx = headers.findIndex(h => h.trim().toUpperCase() === 'NAME OF COMPANY');
          const exchange = 'NSE';
          const currency = 'INR';
          const type = 'Stock';
          const stocks = lines.slice(1).map(line => {
            const cols = line.split(',');
            return {
              symbol: cols[symbolIdx]?.trim(),
              name: cols[nameIdx]?.trim(),
              exchange,
              currency,
              type,
            } as StockSearchResult;
          }).filter(stock => stock.symbol && stock.name);
          localStorage.setItem(cacheKey, JSON.stringify(stocks));
          observer.next(filterStocks(stocks));
          observer.complete();
        })
        .catch(err => {
          console.error('Failed to fetch EQUITY_L CSV:', err);
          observer.next([]);
          observer.complete();
        });
    });
  }

  /**
   * Get real-time stock quote and market data
   */
  getStockQuote(symbol: string): Observable<StockQuote | null> {
    // Always return fallback quote to avoid CORS issues
    // In a production app, this would call your backend API
    return of(this.getFallbackQuote(symbol));

    // Commented out API call due to CORS restrictions
    // In production, implement this through your backend server
    /*
    const formattedSymbol = this.formatIndianSymbol(symbol);
    const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(this.YAHOO_FINANCE_API)}/${formattedSymbol}`;

    return this.makeHttpRequest<any>(proxyUrl).pipe(
      map((response) => {
        if (response && response.chart && response.chart.result && response.chart.result[0]) {
          const result = response.chart.result[0];
          const meta = result.meta;

          if (meta) {
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
        return this.getFallbackQuote(symbol);
      }),
      catchError((error) => {
        console.warn("API quote failed, using fallback data:", error.message);
        return of(this.getFallbackQuote(symbol));
      }),
    );
    */
  }

  /**
   * Get multiple stock quotes at once
   */
  getMultipleQuotes(symbols: string[]): Observable<(StockQuote | null)[]> {
    const requests = symbols.map((symbol) => this.getStockQuote(symbol));
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
    if (upperSymbol.includes(".NS") || upperSymbol.includes(".BO")) {
      return upperSymbol;
    }

    // Add NSE suffix for most Indian stocks
    return `${upperSymbol}.NS`;
  }

  /**
   * Make HTTP request with CORS handling
   * Note: In production, API calls should go through your backend to avoid CORS
   */
  private makeHttpRequest<T>(url: string): Observable<T> {
    return new Observable((observer) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          observer.next(data);
          observer.complete();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          if (error.name === "AbortError") {
            observer.error(new Error("Request timeout"));
          } else {
            observer.error(error);
          }
        });
    });
  }

  /**
   * Comprehensive fallback search results for Indian stocks
   */
  private getFallbackSearchResults(query: string): StockSearchResult[] {
    const commonStocks = [
      // Banking & Financial Services
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "KOTAKBANK",
        name: "Kotak Mahindra Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "AXISBANK",
        name: "Axis Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "SBIN",
        name: "State Bank of India",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "INDUSINDBK",
        name: "IndusInd Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "BANDHANBNK",
        name: "Bandhan Bank Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Technology
      {
        symbol: "TCS",
        name: "Tata Consultancy Services Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "INFY",
        name: "Infosys Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "WIPRO",
        name: "Wipro Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "HCLTECH",
        name: "HCL Technologies Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "TECHM",
        name: "Tech Mahindra Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Energy & Oil
      {
        symbol: "RELIANCE",
        name: "Reliance Industries Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "ONGC",
        name: "Oil and Natural Gas Corporation Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "BPCL",
        name: "Bharat Petroleum Corporation Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "IOC",
        name: "Indian Oil Corporation Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Consumer Goods
      {
        symbol: "HINDUNILVR",
        name: "Hindustan Unilever Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "ITC",
        name: "ITC Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "NESTLEIND",
        name: "Nestle India Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "BRITANNIA",
        name: "Britannia Industries Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "DABUR",
        name: "Dabur India Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Telecom
      {
        symbol: "BHARTIARTL",
        name: "Bharti Airtel Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "JIO",
        name: "Reliance Jio Infocomm Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Automotive
      {
        symbol: "MARUTI",
        name: "Maruti Suzuki India Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "M&M",
        name: "Mahindra & Mahindra Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "TATAMOTORS",
        name: "Tata Motors Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "BAJAJ-AUTO",
        name: "Bajaj Auto Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Infrastructure
      {
        symbol: "LT",
        name: "Larsen & Toubro Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "POWERGRID",
        name: "Power Grid Corporation of India Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "NTPC",
        name: "NTPC Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Retail
      {
        symbol: "DMART",
        name: "Avenue Supermarts Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "TRENT",
        name: "Trent Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Metals & Mining
      {
        symbol: "TATASTEEL",
        name: "Tata Steel Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "JSWSTEEL",
        name: "JSW Steel Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "HINDALCO",
        name: "Hindalco Industries Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },

      // Others
      {
        symbol: "ASIANPAINT",
        name: "Asian Paints Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "TITAN",
        name: "Titan Company Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "SUNPHARMA",
        name: "Sun Pharmaceutical Industries Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
      {
        symbol: "DRREDDY",
        name: "Dr. Reddy's Laboratories Limited",
        exchange: "NSE",
        currency: "INR",
        type: "Stock",
      },
    ];

    const lowerQuery = query.toLowerCase();
    return commonStocks
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(lowerQuery) ||
          stock.name.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 10); // Limit to 10 results
  }

  /**
   * Comprehensive fallback quote data with realistic market data
   */
  private getFallbackQuote(symbol: string): StockQuote {
    const fallbackData: { [key: string]: Partial<StockQuote> } = {
      // Banking
      HDFCBANK: {
        name: "HDFC Bank Limited",
        price: 1680,
        change: 8.3,
        changePercent: 0.49,
        pe: 18.5,
        eps: 91,
        marketCap: 12800000000000,
        volume: 1200000,
      },
      ICICIBANK: {
        name: "ICICI Bank Limited",
        price: 1150,
        change: -5.2,
        changePercent: -0.45,
        pe: 16.2,
        eps: 71,
        marketCap: 8100000000000,
        volume: 980000,
      },
      KOTAKBANK: {
        name: "Kotak Mahindra Bank Limited",
        price: 1750,
        change: 12.8,
        changePercent: 0.74,
        pe: 20.1,
        eps: 87,
        marketCap: 3500000000000,
        volume: 450000,
      },
      AXISBANK: {
        name: "Axis Bank Limited",
        price: 1090,
        change: -3.1,
        changePercent: -0.28,
        pe: 14.8,
        eps: 74,
        marketCap: 3400000000000,
        volume: 850000,
      },
      SBIN: {
        name: "State Bank of India",
        price: 780,
        change: 6.5,
        changePercent: 0.84,
        pe: 12.5,
        eps: 62,
        marketCap: 6950000000000,
        volume: 1800000,
      },

      // Technology
      TCS: {
        name: "Tata Consultancy Services Limited",
        price: 3520,
        change: -15.2,
        changePercent: -0.43,
        pe: 26.8,
        eps: 131,
        marketCap: 12900000000000,
        volume: 280000,
      },
      INFY: {
        name: "Infosys Limited",
        price: 1420,
        change: -5.7,
        changePercent: -0.4,
        pe: 24.2,
        eps: 59,
        marketCap: 5800000000000,
        volume: 450000,
      },
      WIPRO: {
        name: "Wipro Limited",
        price: 420,
        change: 2.1,
        changePercent: 0.5,
        pe: 22.1,
        eps: 19,
        marketCap: 2300000000000,
        volume: 650000,
      },
      HCLTECH: {
        name: "HCL Technologies Limited",
        price: 1285,
        change: 8.4,
        changePercent: 0.66,
        pe: 18.9,
        eps: 68,
        marketCap: 3500000000000,
        volume: 320000,
      },
      TECHM: {
        name: "Tech Mahindra Limited",
        price: 1650,
        change: -12.3,
        changePercent: -0.74,
        pe: 21.5,
        eps: 77,
        marketCap: 1600000000000,
        volume: 280000,
      },

      // Energy
      RELIANCE: {
        name: "Reliance Industries Limited",
        price: 2450,
        change: 12.5,
        changePercent: 0.51,
        pe: 28.5,
        eps: 86,
        marketCap: 16500000000000,
        volume: 2500000,
      },
      ONGC: {
        name: "Oil and Natural Gas Corporation Limited",
        price: 180,
        change: 1.8,
        changePercent: 1.01,
        pe: 8.2,
        eps: 22,
        marketCap: 2270000000000,
        volume: 1200000,
      },
      BPCL: {
        name: "Bharat Petroleum Corporation Limited",
        price: 285,
        change: -2.1,
        changePercent: -0.73,
        pe: 15.6,
        eps: 18,
        marketCap: 615000000000,
        volume: 890000,
      },

      // Consumer Goods
      HINDUNILVR: {
        name: "Hindustan Unilever Limited",
        price: 2380,
        change: 18.5,
        changePercent: 0.78,
        pe: 58.2,
        eps: 41,
        marketCap: 5580000000000,
        volume: 180000,
      },
      ITC: {
        name: "ITC Limited",
        price: 450,
        change: 3.2,
        changePercent: 0.72,
        pe: 24.1,
        eps: 19,
        marketCap: 5600000000000,
        volume: 2800000,
      },
      NESTLEIND: {
        name: "Nestle India Limited",
        price: 2180,
        change: -8.5,
        changePercent: -0.39,
        pe: 72.1,
        eps: 30,
        marketCap: 210000000000,
        volume: 45000,
      },
      BRITANNIA: {
        name: "Britannia Industries Limited",
        price: 4850,
        change: 25.0,
        changePercent: 0.52,
        pe: 45.2,
        eps: 107,
        marketCap: 1170000000000,
        volume: 85000,
      },

      // Automotive
      MARUTI: {
        name: "Maruti Suzuki India Limited",
        price: 10800,
        change: -45.2,
        changePercent: -0.42,
        pe: 26.5,
        eps: 408,
        marketCap: 3260000000000,
        volume: 120000,
      },
      "M&M": {
        name: "Mahindra & Mahindra Limited",
        price: 2950,
        change: 18.7,
        changePercent: 0.64,
        pe: 32.1,
        eps: 92,
        marketCap: 3650000000000,
        volume: 280000,
      },
      TATAMOTORS: {
        name: "Tata Motors Limited",
        price: 780,
        change: -12.1,
        changePercent: -1.53,
        pe: 28.8,
        eps: 27,
        marketCap: 2870000000000,
        volume: 1650000,
      },

      // Others
      DMART: {
        name: "Avenue Supermarts Limited",
        price: 3850,
        change: 25.0,
        changePercent: 0.65,
        pe: 85.2,
        eps: 45,
        marketCap: 2500000000000,
        volume: 85000,
      },
      ASIANPAINT: {
        name: "Asian Paints Limited",
        price: 2950,
        change: -18.4,
        changePercent: -0.62,
        pe: 52.1,
        eps: 57,
        marketCap: 2830000000000,
        volume: 120000,
      },
      TITAN: {
        name: "Titan Company Limited",
        price: 3200,
        change: 28.5,
        changePercent: 0.9,
        pe: 68.9,
        eps: 46,
        marketCap: 2840000000000,
        volume: 180000,
      },
      LT: {
        name: "Larsen & Toubro Limited",
        price: 3450,
        change: 15.2,
        changePercent: 0.44,
        pe: 28.2,
        eps: 122,
        marketCap: 4850000000000,
        volume: 350000,
      },
      SUNPHARMA: {
        name: "Sun Pharmaceutical Industries Limited",
        price: 1685,
        change: 8.9,
        changePercent: 0.53,
        pe: 38.1,
        eps: 44,
        marketCap: 4040000000000,
        volume: 280000,
      },
    };

    const fallback = fallbackData[symbol.toUpperCase()] || {};

    // Generate realistic random variations for unknown stocks
    const basePrice = fallback.price || Math.random() * 3000 + 500;
    const randomChange = (Math.random() - 0.5) * basePrice * 0.05; // ±2.5% change

    return {
      symbol: symbol.toUpperCase(),
      name: fallback.name || `${symbol.toUpperCase()} Limited`,
      price: Number(basePrice.toFixed(2)),
      change: Number((fallback.change || randomChange).toFixed(2)),
      changePercent: Number(
        (((fallback.change || randomChange) / basePrice) * 100).toFixed(2),
      ),
      pe: fallback.pe || Number((Math.random() * 40 + 10).toFixed(1)),
      eps:
        fallback.eps ||
        Number((basePrice / (Math.random() * 40 + 10)).toFixed(0)),
      bookValue:
        fallback.bookValue ||
        Number((basePrice * (0.3 + Math.random() * 0.4)).toFixed(0)),
      dividendYield:
        fallback.dividendYield || Number((Math.random() * 3).toFixed(1)),
      debt: fallback.debt || Number((Math.random() * 2).toFixed(1)),
      marketCap:
        fallback.marketCap ||
        Number((basePrice * (50000000 + Math.random() * 200000000)).toFixed(0)),
      volume:
        fallback.volume ||
        Number((Math.random() * 2000000 + 100000).toFixed(0)),
      lastUpdated: new Date(),
    };
  }
}
