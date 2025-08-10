import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

import { LoggerService } from '../../../core/services/logger.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { AuthService } from '../../../core/services/auth.service';

import { PortfolioDataService } from './portfolio-data.service';
import { PortfolioCalculationService } from './portfolio-calculation.service';

import { 
  Portfolio, 
  Stock, 
  CreatePortfolioDto, 
  UpdatePortfolioDto,
  AddStockDto,
  UpdateStockDto,
  PortfolioPerformance,
  RebalanceRecommendation
} from '../models/portfolio.model';
import { AsyncState } from '../../../shared/models/base.model';

@Injectable()
export class PortfolioService {
  // Dependencies
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly authService = inject(AuthService);
  private readonly dataService = inject(PortfolioDataService);
  private readonly calculationService = inject(PortfolioCalculationService);

  // State management
  private readonly portfoliosSubject = new BehaviorSubject<Portfolio[]>([]);
  private readonly selectedPortfolioSubject = new BehaviorSubject<Portfolio | null>(null);
  
  // Reactive state
  private readonly _portfoliosState = signal<AsyncState<Portfolio[]>>({
    isLoading: false,
    hasError: false,
    data: []
  });

  // Public observables
  readonly portfolios$ = this.portfoliosSubject.asObservable();
  readonly selectedPortfolio$ = this.selectedPortfolioSubject.asObservable();

  // Computed signals
  readonly portfolios = computed(() => this._portfoliosState().data || []);
  readonly isLoading = computed(() => this._portfoliosState().isLoading);
  readonly error = computed(() => this._portfoliosState().errorMessage);
  
  readonly totalPortfolioValue = computed(() => {
    return this.portfolios().reduce((sum, portfolio) => sum + portfolio.totalValue, 0);
  });

  readonly averageReturn = computed(() => {
    const portfolios = this.portfolios();
    if (portfolios.length === 0) return 0;
    
    const totalReturn = portfolios.reduce((sum, p) => sum + p.totalReturnPercent, 0);
    return totalReturn / portfolios.length;
  });

  constructor() {
    this.initializeService();
  }

  /**
   * Load all portfolios for the current user
   */
  async loadPortfolios(): Promise<void> {
    const loadingKey = 'portfolios';
    
    try {
      this.updateState({ isLoading: true, hasError: false });
      this.loadingService.setLoadingFor(loadingKey, true);

      const portfolios = await this.dataService.getAllPortfolios();
      
      // Calculate derived values
      const enrichedPortfolios = portfolios.map(portfolio => 
        this.calculationService.calculatePortfolioMetrics(portfolio)
      );

      this.portfoliosSubject.next(enrichedPortfolios);
      this.updateState({ 
        isLoading: false, 
        data: enrichedPortfolios,
        lastUpdated: new Date()
      });

      this.logger.info('Portfolios loaded successfully', { count: enrichedPortfolios.length });
      
    } catch (error) {
      this.handleError('Failed to load portfolios', error as Error);
    } finally {
      this.loadingService.setLoadingFor(loadingKey, false);
    }
  }

  /**
   * Get portfolio by ID
   */
  async getPortfolio(id: string): Promise<Portfolio | null> {
    try {
      this.logger.debug('Fetching portfolio', { portfolioId: id });
      
      const portfolio = await this.dataService.getPortfolioById(id);
      
      if (portfolio) {
        const enrichedPortfolio = this.calculationService.calculatePortfolioMetrics(portfolio);
        this.selectedPortfolioSubject.next(enrichedPortfolio);
        return enrichedPortfolio;
      }
      
      return null;
    } catch (error) {
      this.handleError('Failed to fetch portfolio', error as Error);
      return null;
    }
  }

  /**
   * Create new portfolio
   */
  async createPortfolio(portfolioData: CreatePortfolioDto): Promise<Portfolio | null> {
    try {
      this.loadingService.setLoadingFor('createPortfolio', true);
      
      const user = this.authService.user();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newPortfolio = await this.dataService.createPortfolio({
        ...portfolioData,
        ownerId: user.uid,
        ownerEmail: user.email
      });

      if (newPortfolio) {
        this.notificationService.success(
          'Portfolio created', 
          `"${newPortfolio.name}" has been created successfully`
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Portfolio created successfully', { portfolioId: newPortfolio.id });
        
        return newPortfolio;
      }
      
      return null;
    } catch (error) {
      this.handleError('Failed to create portfolio', error as Error);
      return null;
    } finally {
      this.loadingService.setLoadingFor('createPortfolio', false);
    }
  }

  /**
   * Update existing portfolio
   */
  async updatePortfolio(portfolioData: UpdatePortfolioDto): Promise<boolean> {
    try {
      this.loadingService.setLoadingFor('updatePortfolio', true);
      
      const success = await this.dataService.updatePortfolio(portfolioData);
      
      if (success) {
        this.notificationService.success(
          'Portfolio updated',
          'Portfolio has been updated successfully'
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Portfolio updated successfully', { portfolioId: portfolioData.id });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to update portfolio', error as Error);
      return false;
    } finally {
      this.loadingService.setLoadingFor('updatePortfolio', false);
    }
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(portfolioId: string): Promise<boolean> {
    try {
      this.loadingService.setLoadingFor('deletePortfolio', true);
      
      const success = await this.dataService.deletePortfolio(portfolioId);
      
      if (success) {
        this.notificationService.success(
          'Portfolio deleted',
          'Portfolio has been deleted successfully'
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Portfolio deleted successfully', { portfolioId });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to delete portfolio', error as Error);
      return false;
    } finally {
      this.loadingService.setLoadingFor('deletePortfolio', false);
    }
  }

  /**
   * Add stock to portfolio
   */
  async addStock(stockData: AddStockDto): Promise<boolean> {
    try {
      this.loadingService.setLoadingFor('addStock', true);
      
      const success = await this.dataService.addStockToPortfolio(stockData);
      
      if (success) {
        this.notificationService.success(
          'Stock added',
          `${stockData.ticker} has been added to your portfolio`
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Stock added successfully', { 
          portfolioId: stockData.portfolioId, 
          ticker: stockData.ticker 
        });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to add stock', error as Error);
      return false;
    } finally {
      this.loadingService.setLoadingFor('addStock', false);
    }
  }

  /**
   * Update stock in portfolio
   */
  async updateStock(stockData: UpdateStockDto): Promise<boolean> {
    try {
      const success = await this.dataService.updateStock(stockData);
      
      if (success) {
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Stock updated successfully', { 
          portfolioId: stockData.portfolioId, 
          stockId: stockData.stockId 
        });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to update stock', error as Error);
      return false;
    }
  }

  /**
   * Remove stock from portfolio
   */
  async removeStock(portfolioId: string, stockId: string): Promise<boolean> {
    try {
      const success = await this.dataService.removeStockFromPortfolio(portfolioId, stockId);
      
      if (success) {
        this.notificationService.success(
          'Stock removed',
          'Stock has been removed from your portfolio'
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Stock removed successfully', { portfolioId, stockId });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to remove stock', error as Error);
      return false;
    }
  }

  /**
   * Get rebalance recommendations
   */
  getRebalanceRecommendations(portfolioId: string): Observable<RebalanceRecommendation[]> {
    return this.selectedPortfolio$.pipe(
      map(portfolio => {
        if (!portfolio || portfolio.id !== portfolioId) {
          return [];
        }
        
        return this.calculationService.calculateRebalanceRecommendations(portfolio);
      }),
      catchError(error => {
        this.handleError('Failed to calculate rebalance recommendations', error);
        return [];
      })
    );
  }

  /**
   * Execute portfolio rebalancing
   */
  async rebalancePortfolio(portfolioId: string): Promise<boolean> {
    try {
      this.loadingService.setLoadingFor('rebalance', true);
      
      const portfolio = await this.getPortfolio(portfolioId);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const recommendations = this.calculationService.calculateRebalanceRecommendations(portfolio);
      const success = await this.dataService.executeRebalance(portfolioId, recommendations);
      
      if (success) {
        this.notificationService.success(
          'Portfolio rebalanced',
          'Your portfolio has been rebalanced successfully'
        );
        
        await this.loadPortfolios(); // Refresh the list
        this.logger.info('Portfolio rebalanced successfully', { portfolioId });
      }
      
      return success;
    } catch (error) {
      this.handleError('Failed to rebalance portfolio', error as Error);
      return false;
    } finally {
      this.loadingService.setLoadingFor('rebalance', false);
    }
  }

  /**
   * Get portfolio performance history
   */
  getPortfolioPerformance(portfolioId: string, days: number = 30): Observable<PortfolioPerformance[]> {
    return this.dataService.getPortfolioPerformance(portfolioId, days).pipe(
      catchError(error => {
        this.handleError('Failed to fetch portfolio performance', error);
        return [];
      })
    );
  }

  // Private methods

  private initializeService(): void {
    // Load portfolios when user authentication changes
    this.authService.authStatus$().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadPortfolios();
      } else {
        this.resetState();
      }
    });
  }

  private updateState(partialState: Partial<AsyncState<Portfolio[]>>): void {
    this._portfoliosState.update(currentState => ({
      ...currentState,
      ...partialState
    }));
  }

  private resetState(): void {
    this.portfoliosSubject.next([]);
    this.selectedPortfolioSubject.next(null);
    this.updateState({
      isLoading: false,
      hasError: false,
      data: [],
      errorMessage: undefined
    });
  }

  private handleError(message: string, error: Error): void {
    this.logger.error(message, error);
    this.updateState({
      isLoading: false,
      hasError: true,
      errorMessage: message
    });
    this.notificationService.error('Error', message);
  }
}
