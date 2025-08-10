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
  stocks: Stock[];
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
  // New fields for ownership and sharing
  ownerId: string;
  ownerEmail: string;
  isShared?: boolean;
  shareId?: string;
  permissions?: SharePermissions;
  comments?: PortfolioComment[];
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
