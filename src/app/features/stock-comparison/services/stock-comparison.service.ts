import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  StockComparison,
  ComparisonFilter,
  ComparisonAnalysis,
  ComparedStock,
  ComparisonPromptSettings,
  GenerationMetadata,
} from '../models/stock-comparison.model';

@Injectable({
  providedIn: 'root',
})
export class StockComparisonService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  // Signal for tracking loading state
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private readonly COLLECTION_NAME = 'stock_comparisons';

  /**
   * Create and save a new stock comparison
   */
  async createComparison(
    stocks: ComparedStock[],
    analysis: ComparisonAnalysis,
    ratings: { [ticker: string]: number },
    generationMetadata: GenerationMetadata,
    options?: {
      title?: string;
      notes?: string;
      portfolioId?: string;
      customPrompts?: Partial<ComparisonPromptSettings>;
      useCustomPrompts?: boolean;
    }
  ): Promise<string> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated to save comparisons');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      const comparisonData: Omit<StockComparison, 'id'> = {
        userId: user.uid,
        portfolioId: options?.portfolioId,
        stocks,
        analysis,
        ratings,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        title: options?.title || this.generateDefaultTitle(stocks),
        notes: options?.notes,
        customPrompts: options?.customPrompts,
        useCustomPrompts: options?.useCustomPrompts || false,
        generationMetadata: {
          ...generationMetadata,
          timestamp: serverTimestamp() as Timestamp,
        },
      };

      const docRef = await addDoc(
        collection(this.firestore, this.COLLECTION_NAME),
        comparisonData
      );

      this.logger.info('Stock comparison saved successfully', {
        id: docRef.id,
        stocks: stocks.map((s) => s.ticker),
      });

      return docRef.id;
    } catch (error: any) {
      this.logger.error('Failed to save stock comparison', error);
      this.error.set('Failed to save comparison');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get a single comparison by ID
   */
  async getComparison(comparisonId: string): Promise<StockComparison | null> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.COLLECTION_NAME, comparisonId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        this.logger.warn('Comparison not found', { comparisonId });
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
      } as StockComparison;
    } catch (error: any) {
      this.logger.error('Failed to fetch comparison', error);
      this.error.set('Failed to load comparison');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Load all comparisons for the current user
   */
  async getUserComparisons(
    filter?: ComparisonFilter
  ): Promise<StockComparison[]> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      let q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      // Apply filters if provided
      if (filter) {
        q = this.applyFilters(q, filter);
      }

      const querySnapshot = await getDocs(q);

      const comparisons: StockComparison[] = [];
      querySnapshot.forEach((doc) => {
        comparisons.push({
          id: doc.id,
          ...doc.data(),
        } as StockComparison);
      });

      this.logger.info('User comparisons loaded', {
        count: comparisons.length,
      });

      return comparisons;
    } catch (error: any) {
      this.logger.error('Failed to load user comparisons', error);
      this.error.set('Failed to load comparison history');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Update an existing comparison
   */
  async updateComparison(
    comparisonId: string,
    updates: Partial<StockComparison>
  ): Promise<boolean> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.COLLECTION_NAME, comparisonId);

      // Verify ownership
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Comparison not found');
      }

      const data = snapshot.data();
      if (data['userId'] !== user.uid) {
        throw new Error('Unauthorized to update this comparison');
      }

      // Remove fields that shouldn't be updated
      const { id, userId, createdAt, ...updateData } = updates as any;

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });

      this.logger.info('Comparison updated successfully', { comparisonId });
      return true;
    } catch (error: any) {
      this.logger.error('Failed to update comparison', error);
      this.error.set('Failed to update comparison');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Delete a comparison
   */
  async deleteComparison(comparisonId: string): Promise<boolean> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      const docRef = doc(this.firestore, this.COLLECTION_NAME, comparisonId);

      // Verify ownership
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new Error('Comparison not found');
      }

      const data = snapshot.data();
      if (data['userId'] !== user.uid) {
        throw new Error('Unauthorized to delete this comparison');
      }

      await deleteDoc(docRef);

      this.logger.info('Comparison deleted successfully', { comparisonId });
      return true;
    } catch (error: any) {
      this.logger.error('Failed to delete comparison', error);
      this.error.set('Failed to delete comparison');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get comparisons for a specific portfolio
   */
  async getPortfolioComparisons(
    portfolioId: string
  ): Promise<StockComparison[]> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        where('userId', '==', user.uid),
        where('portfolioId', '==', portfolioId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      const comparisons: StockComparison[] = [];
      querySnapshot.forEach((doc) => {
        comparisons.push({
          id: doc.id,
          ...doc.data(),
        } as StockComparison);
      });

      return comparisons;
    } catch (error: any) {
      this.logger.error('Failed to load portfolio comparisons', error);
      this.error.set('Failed to load portfolio comparisons');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get comparisons involving a specific stock
   */
  async getStockComparisons(ticker: string): Promise<StockComparison[]> {
    const user = this.authService.user()();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Note: This requires filtering in memory as Firestore doesn't support
      // array-contains-any on nested objects
      const allComparisons = await this.getUserComparisons();

      return allComparisons.filter((comp) =>
        comp.stocks.some((stock) => stock.ticker === ticker)
      );
    } catch (error: any) {
      this.logger.error('Failed to load stock comparisons', error);
      this.error.set('Failed to load stock comparisons');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Generate default title from stock tickers
   */
  private generateDefaultTitle(stocks: ComparedStock[]): string {
    const tickers = stocks.map((s) => s.ticker).join(' vs ');
    const date = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${tickers} - ${date}`;
  }

  /**
   * Apply filters to Firestore query
   */
  private applyFilters(
    q: Query<DocumentData>,
    filter: ComparisonFilter
  ): Query<DocumentData> {
    // Note: Some filters need to be applied in memory after fetching
    // due to Firestore query limitations

    if (filter.portfolioId) {
      q = query(q, where('portfolioId', '==', filter.portfolioId));
    }

    if (filter.hasCustomPrompts !== undefined) {
      q = query(q, where('useCustomPrompts', '==', filter.hasCustomPrompts));
    }

    return q;
  }

  /**
   * Calculate overall rating from category scores
   */
  calculateOverallRating(
    analysis: ComparisonAnalysis,
    ticker: string
  ): number {
    const scores: number[] = [];

    if (analysis.productsAndServices?.stockInsights[ticker]) {
      scores.push(analysis.productsAndServices.stockInsights[ticker].score);
    }

    if (analysis.financialStability?.stockInsights[ticker]) {
      scores.push(analysis.financialStability.stockInsights[ticker].score);
    }

    if (analysis.fundamentals?.stockInsights[ticker]) {
      scores.push(analysis.fundamentals.stockInsights[ticker].score);
    }

    if (scores.length === 0) return 0;

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal
  }

  /**
   * Export comparison as JSON
   */
  exportComparison(comparison: StockComparison): string {
    return JSON.stringify(comparison, null, 2);
  }

  /**
   * Get statistics about user's comparisons
   */
  async getComparisonStats(): Promise<{
    total: number;
    thisMonth: number;
    withCustomPrompts: number;
    mostComparedStocks: { ticker: string; count: number }[];
  }> {
    const comparisons = await this.getUserComparisons();

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: comparisons.length,
      thisMonth: comparisons.filter((c) => {
        const createdAt =
          c.createdAt instanceof Timestamp
            ? c.createdAt.toDate()
            : c.createdAt;
        return createdAt >= thisMonthStart;
      }).length,
      withCustomPrompts: comparisons.filter((c) => c.useCustomPrompts).length,
      mostComparedStocks: this.getMostComparedStocks(comparisons),
    };

    return stats;
  }

  /**
   * Get most frequently compared stocks
   */
  private getMostComparedStocks(
    comparisons: StockComparison[]
  ): { ticker: string; count: number }[] {
    const tickerCounts: Map<string, number> = new Map();

    comparisons.forEach((comp) => {
      comp.stocks.forEach((stock) => {
        tickerCounts.set(
          stock.ticker,
          (tickerCounts.get(stock.ticker) || 0) + 1
        );
      });
    });

    return Array.from(tickerCounts.entries())
      .map(([ticker, count]) => ({ ticker, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
