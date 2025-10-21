import { Timestamp } from 'firebase/firestore';

// ===== COMPARISON MODELS =====

export interface StockComparison {
  id: string;
  userId: string;
  portfolioId?: string; // Optional portfolio context
  stocks: ComparedStock[];
  analysis: ComparisonAnalysis;
  ratings: { [ticker: string]: number }; // Overall rating out of 10
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  title?: string; // User-defined title
  notes?: string; // User notes on comparison

  // Custom prompt overrides for this comparison
  customPrompts?: Partial<ComparisonPromptSettings>;
  useCustomPrompts: boolean;

  // Analysis metadata
  generationMetadata: GenerationMetadata;
}

export interface ComparedStock {
  ticker: string;
  name: string;
  currentPrice: number;
  marketData: MarketDataSnapshot;
}

export interface MarketDataSnapshot {
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividendYield?: number;
  debtToEquity?: number;
  roe?: number;
  bookValue?: number;
}

export interface ComparisonAnalysis {
  productsAndServices?: CategoryComparison;
  financialStability?: CategoryComparison;
  fundamentals?: CategoryComparison;
  strengths?: CategoryComparison;
  summary: string; // Overall comparison conclusion
  recommendation: string; // Best pick and why
}

export interface CategoryComparison {
  description: string; // Category explanation
  stockInsights: {
    [ticker: string]: StockInsight;
  };
  winner: string; // Ticker of best stock in category
}

export interface StockInsight {
  analysis: string; // Detailed analysis text
  score: number; // 0-10 score for this category
  highlights: string[]; // Key points
}

export interface GenerationMetadata {
  model: string;
  temperature: number;
  tokensUsed: number;
  generationTime: number; // Time in ms
  promptVersion: string;
  timestamp: Date | Timestamp;
}

// ===== PROMPT SETTINGS MODELS =====

export interface ComparisonPromptSettings {
  // Prompt templates for each category
  productsAndServices: PromptTemplate;
  financialStability: PromptTemplate;
  fundamentals: PromptTemplate;

  // AI generation settings
  generationConfig: GeminiGenerationConfig;

  // Display preferences
  defaultStockCount: number; // 2-5, default: 3
  autoSaveComparisons: boolean;
  showDetailedScores: boolean;

  // Metadata
  lastUpdated: Date | Timestamp;
}

export interface PromptTemplate {
  enabled: boolean; // Enable/disable this category
  systemPrompt: string; // Base instruction for AI
  customInstructions: string; // User's additional instructions
  focusAreas: string[]; // Specific aspects to emphasize
  outputFormat: 'detailed' | 'concise'; // Verbosity level

  // Examples for few-shot learning
  examples?: PromptExample[];
}

export interface PromptExample {
  input: string; // Example stock comparison
  expectedOutput: string; // Desired analysis format
}

export interface GeminiGenerationConfig {
  temperature: number; // 0.0-1.0, creativity level
  topK: number; // Token selection diversity
  topP: number; // Nucleus sampling threshold
  maxOutputTokens: number; // Response length limit
  model: string; // Gemini model version
}

// ===== DEFAULT CONFIGURATIONS =====

export const DEFAULT_PRODUCTS_SERVICES_PROMPT: PromptTemplate = {
  enabled: true,
  systemPrompt: `You are analyzing the products and services of Indian companies for investment comparison.

Evaluate each company on:
1. **Product Portfolio**: Breadth and depth of offerings
2. **Market Position**: Market share and competitive standing
3. **Innovation**: R&D investments and new product launches
4. **Diversification**: Revenue stream variety and geographic reach
5. **Customer Base**: Quality and loyalty of customer segments

Provide a score (0-10) and detailed analysis for each company.`,
  customInstructions: '',
  focusAreas: [
    'Product diversity',
    'Market leadership',
    'Innovation capability',
    'Revenue diversification',
    'Customer retention',
  ],
  outputFormat: 'detailed',
  examples: [],
};

export const DEFAULT_FINANCIAL_STABILITY_PROMPT: PromptTemplate = {
  enabled: true,
  systemPrompt: `You are evaluating the financial health and stability of Indian companies.

Assess each company on:
1. **Debt Management**: Debt-to-equity ratio, interest coverage
2. **Cash Flow**: Operating cash flow, free cash flow generation
3. **Profitability**: Net margins, ROE, ROA trends
4. **Liquidity**: Current ratio, quick ratio, working capital
5. **Capital Allocation**: Dividend policy, buybacks, capex

Provide a score (0-10) and detailed analysis for each company.`,
  customInstructions: '',
  focusAreas: [
    'Debt levels',
    'Cash flow strength',
    'Profit margins',
    'Liquidity position',
    'Capital efficiency',
  ],
  outputFormat: 'detailed',
  examples: [],
};

export const DEFAULT_FUNDAMENTALS_PROMPT: PromptTemplate = {
  enabled: true,
  systemPrompt: `You are analyzing fundamental metrics of Indian stocks for investment decisions.

Evaluate each company on:
1. **Valuation**: P/E, P/B, PEG ratios vs industry/historical averages
2. **Growth**: Revenue growth, earnings growth (3-5 year CAGR)
3. **Quality**: ROE, ROCE, asset turnover trends
4. **Dividend**: Dividend yield, payout ratio, consistency
5. **Competitive Moat**: Sustainable competitive advantages

Provide a score (0-10) and detailed analysis for each company.`,
  customInstructions: '',
  focusAreas: [
    'Valuation metrics',
    'Growth trajectory',
    'Return ratios',
    'Dividend strength',
    'Economic moat',
  ],
  outputFormat: 'detailed',
  examples: [],
};

export const DEFAULT_GENERATION_CONFIG: GeminiGenerationConfig = {
  temperature: 0.3, // Low for consistent, factual analysis
  topK: 40, // Moderate diversity
  topP: 0.95, // High quality token selection
  maxOutputTokens: 4096, // Detailed comparison needs more tokens
  model: 'gemini-1.5-flash-latest',
};

export const DEFAULT_COMPARISON_PROMPT_SETTINGS: ComparisonPromptSettings = {
  productsAndServices: DEFAULT_PRODUCTS_SERVICES_PROMPT,
  financialStability: DEFAULT_FINANCIAL_STABILITY_PROMPT,
  fundamentals: DEFAULT_FUNDAMENTALS_PROMPT,
  generationConfig: DEFAULT_GENERATION_CONFIG,
  defaultStockCount: 3,
  autoSaveComparisons: true,
  showDetailedScores: true,
  lastUpdated: new Date(),
};

// ===== UTILITY TYPES =====

export type ComparisonCategory =
  | 'productsAndServices'
  | 'financialStability'
  | 'fundamentals'
  | 'strengths';

export interface ComparisonFilter {
  fromDate?: Date;
  toDate?: Date;
  minStocks?: number;
  maxStocks?: number;
  portfolioId?: string;
  hasCustomPrompts?: boolean;
}
