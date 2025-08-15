export interface Stock {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  sector?: string;
  weight: number;
  shares: number;
  quantity?: number;
  currentPrice: number;
  totalValue: number;
  notes: StockNote[];
  marketData?: MarketData;
  priceHistory?: PriceHistory[];
  dividends?: Dividend[];
  isCashStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockNote {
  id: string;
  section: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string;
  authorEmail?: string;
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

export interface PortfolioComment {
  id: string;
  content: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  portfolioId: string;
}

export interface SharePermissions {
  canEdit: boolean;
  canEditStocks: boolean;
  canEditWeights: boolean;
  canAddNotes: boolean;
  canComment: boolean;
}

export interface PortfolioShare {
  id: string;
  portfolioId: string;
  sharedWithEmail: string;
  sharedById: string;
  sharedByEmail: string;
  permissions: SharePermissions;
  createdAt: Date;
  updatedAt: Date;
  message?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  type: "equity" | "debt" | "hybrid" | "index" | "custom";
  stocks: Stock[];
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  // Enhanced budget and constraint fields
  budget: number;
  maxStocks: number;
  maxStockAllocationPercent: number;
  availableCash: number;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  // Optional fields
  isTemplate?: boolean;
  ownerId: string;
  ownerEmail: string;
  isShared?: boolean;
  shareId?: string;
  permissions?: SharePermissions;
  comments?: PortfolioComment[];
  tags?: string[];
  category?: string;
  riskLevel?: string;
  targetReturn?: number;
  rebalanceFrequency?: string;
}

export interface PortfolioPerformance {
  date: Date;
  value: number;
  return: number;
  returnPercent: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// Additional interfaces for enhanced functionality
export interface PriceHistory {
  id: string;
  stockId: string;
  price: number;
  quantity: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dividend {
  id: string;
  amount: number;
  exDate: Date;
  payDate: Date;
  recordDate?: Date;
  frequency: string;
  currency: string;
  stockId: string;
  portfolioId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
