export interface Stock {
  id: string;
  ticker: string;
  name: string;
  weight: number;
  shares: number;
  currentPrice: number;
  totalValue: number;
  notes: StockNote[];
  marketData?: MarketData;
}

export interface StockNote {
  id: string;
  section: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  pe: number;
  bookValue: number;
  eps: number;
  dividendYield: number;
  debt: number;
  marketCap: number;
  volume: number;
  lastUpdated: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  stocks: Stock[];
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
}

export interface PortfolioPerformance {
  date: Date;
  value: number;
  return: number;
  returnPercent: number;
}
