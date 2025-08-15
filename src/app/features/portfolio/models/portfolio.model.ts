import { BaseEntity, OwnedEntity } from "../../../shared/models/base.model";

export interface Portfolio extends OwnedEntity {
  name: string;
  description: string;
  type: PortfolioType;
  stocks: Stock[];
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  // Budget and constraint fields
  budget: number;
  maxStocks: number;
  maxStockAllocationPercent: number;
  availableCash: number;
  // Existing optional fields
  isTemplate?: boolean;
  isShared?: boolean;
  shareId?: string;
  permissions?: SharePermissions;
  comments?: PortfolioComment[];
  tags?: string[];
  category?: string;
  riskLevel?: RiskLevel;
  targetReturn?: number;
  rebalanceFrequency?: RebalanceFrequency;
}

export interface Stock extends BaseEntity {
  ticker: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  weight: number;
  targetWeight?: number;
  shares: number;
  currentPrice: number;
  averagePrice?: number;
  totalValue: number;
  totalInvested?: number;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
  notes: StockNote[];
  marketData?: MarketData;
  dividends?: Dividend[];
  transactions?: Transaction[];
  // New fields for manual management
  priceHistory: PriceHistory[];
  quantity: number;
  isCashStock?: boolean;
}

export interface StockNote extends BaseEntity {
  section: string;
  content: string;
  authorId?: string;
  authorEmail?: string;
  tags?: string[];
  isPrivate?: boolean;
}

export interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  pe: number;
  bookValue: number;
  eps: number;
  dividendYield: number;
  debt: number;
  marketCap: number;
  volume: number;
  averageVolume?: number;
  beta?: number;
  lastUpdated: Date;
}

export interface Dividend extends BaseEntity {
  amount: number;
  exDate: Date;
  payDate: Date;
  recordDate?: Date;
  frequency: DividendFrequency;
  currency: string;
  stockId: string;
  portfolioId: string;
  notes?: string;
}

export interface Transaction extends BaseEntity {
  type: TransactionType;
  shares: number;
  price: number;
  totalAmount: number;
  fees?: number;
  taxes?: number;
  notes?: string;
  orderId?: string;
  executedAt: Date;
}

export interface PortfolioComment extends BaseEntity {
  content: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  portfolioId: string;
  parentCommentId?: string;
  replies?: PortfolioComment[];
  isEdited?: boolean;
  editedAt?: Date;
}

export interface SharePermissions {
  canView: boolean;
  canEdit: boolean;
  canEditStocks: boolean;
  canEditWeights: boolean;
  canAddNotes: boolean;
  canComment: boolean;
  canShare: boolean;
  canDelete: boolean;
}

export interface PortfolioShare extends BaseEntity {
  portfolioId: string;
  sharedWithEmail: string;
  sharedById: string;
  sharedByEmail: string;
  permissions: SharePermissions;
  message?: string;
  expiresAt?: Date;
  isActive: boolean;
}

// New interfaces for enhanced functionality
export interface PriceHistory extends BaseEntity {
  stockId: string;
  price: number;
  quantity: number;
  date: Date;
  notes?: string;
}

export interface PortfolioPerformance extends BaseEntity {
  portfolioId: string;
  date: Date;
  value: number;
  return: number;
  returnPercent: number;
  benchmark?: number;
  benchmarkReturn?: number;
}

export interface PortfolioAllocation {
  sector: string;
  percentage: number;
  value: number;
  stocks: Stock[];
}

export interface PortfolioRisk {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number; // Value at Risk 95%
  correlationMatrix?: { [key: string]: number };
}

export interface RebalanceRecommendation {
  stock: Stock;
  currentWeight: number;
  targetWeight: number;
  difference: number;
  action: "buy" | "sell" | "hold";
  recommendedShares: number;
  estimatedCost: number;
}

// Enums and Types
export type PortfolioType = "equity" | "debt" | "hybrid" | "index" | "custom";
export type RiskLevel =
  | "conservative"
  | "moderate"
  | "aggressive"
  | "very_aggressive";
export type RebalanceFrequency =
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "manual";
export type DividendFrequency =
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "special";
export type TransactionType =
  | "buy"
  | "sell"
  | "dividend"
  | "split"
  | "bonus"
  | "rights";

// DTOs for API communication
export interface CreatePortfolioDto {
  name: string;
  description: string;
  type: PortfolioType;
  budget: number;
  maxStocks: number;
  maxStockAllocationPercent: number;
  category?: string;
  tags?: string[];
  riskLevel?: RiskLevel;
  targetReturn?: number;
  rebalanceFrequency?: RebalanceFrequency;
}

export interface UpdatePortfolioDto extends Partial<CreatePortfolioDto> {
  id: string;
}

export interface AddStockDto {
  portfolioId: string;
  ticker: string;
  name: string;
  exchange: string;
  shares: number;
  price: number;
  weight?: number;
  allocationPercent: number;
  quantity: number;
  isCashStock?: boolean;
}

export interface BatchPriceUpdateDto {
  portfolioId: string;
  stockUpdates: {
    stockId: string;
    price: number;
    quantity?: number;
  }[];
  notes?: string;
}

export interface AddDividendDto {
  portfolioId: string;
  stockId: string;
  amount: number;
  exDate: Date;
  payDate: Date;
  frequency: DividendFrequency;
  notes?: string;
}

export interface UpdatePortfolioBudgetDto {
  portfolioId: string;
  additionalAmount: number;
  notes?: string;
}

export interface UpdateStockDto {
  portfolioId: string;
  stockId: string;
  shares?: number;
  weight?: number;
  targetWeight?: number;
}

export interface SharePortfolioDto {
  portfolioId: string;
  email: string;
  permissions: SharePermissions;
  message?: string;
  expiresAt?: Date;
}
