import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import { FirebasePortfolioService } from "../../../../services/firebase-portfolio.service";
import { PortfolioCalculationService } from "../../services/portfolio-calculation.service";
import { Portfolio, Stock, BatchPriceUpdateDto, AddDividendDto, UpdatePortfolioBudgetDto, UpdatePortfolioDto } from "../../models/portfolio.model";

// Import new components
import { BatchPriceUpdateComponent } from "../batch-price-update/batch-price-update.component";
import { PriceHistoryComponent } from "../price-history/price-history.component";
import { DividendTrackerComponent } from "../dividend-tracker/dividend-tracker.component";
import { CashManagementComponent } from "../cash-management/cash-management.component";
import { PortfolioEditFormComponent } from "../portfolio-edit-form/portfolio-edit-form.component";

@Component({
  selector: "app-portfolio-detail-enhanced",
  standalone: true,
  imports: [
    CommonModule,
    BatchPriceUpdateComponent,
    PriceHistoryComponent,
    DividendTrackerComponent,
    CashManagementComponent,
    PortfolioEditFormComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      @if (portfolio()) {
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button
                  (click)="goBack()"
                  class="text-slate-400 hover:text-slate-600"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 class="text-3xl font-bold text-slate-900">
                    {{ portfolio()!.name }}
                  </h1>
                  <p class="text-slate-600 mt-1">
                    {{ portfolio()!.description }}
                  </p>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ formatPortfolioType(portfolio()!.type) }}
                    </span>
                    @if (portfolio()!.riskLevel) {
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {{ portfolio()!.riskLevel ? formatRiskLevel(portfolio()!.riskLevel!) : 'Not Set' }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  (click)="toggleEditMode()"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Portfolio
                </button>
                <button
                  (click)="toggleBatchPriceUpdate()"
                  class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                  </svg>
                  Update Prices
                </button>
                <button
                  (click)="rebalancePortfolio()"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Rebalance
                </button>
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Enhanced Portfolio Stats -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Budget</p>
                  <p class="text-2xl font-bold text-slate-900">
                    ₹{{ portfolio()!.budget | number: "1.0-0" }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Value</p>
                  <p class="text-2xl font-bold text-slate-900">
                    ₹{{ portfolio()!.totalValue | number: "1.0-0" }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Cash Available</p>
                  <p class="text-2xl font-bold text-green-600">
                    ₹{{ cashPosition().availableCash | number: "1.0-0" }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Holdings</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{ nonCashStocks().length }} / {{ portfolio()!.maxStocks }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-indigo-100 rounded-lg">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Max per Stock</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{ portfolio()!.maxStockAllocationPercent }}%
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-rose-100 rounded-lg">
                  <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Return</p>
                  <p class="text-2xl font-bold text-green-600">
                    +{{ portfolio()!.totalReturnPercent | number: "1.1-1" }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Tabs -->
          <div class="bg-white rounded-xl shadow-lg border border-slate-200">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex">
                <button
                  (click)="activeTab.set('holdings')"
                  [class]="getTabClass('holdings')"
                  class="py-4 px-6 border-b-2 font-medium text-sm"
                >
                  Stock Holdings
                </button>
                <button
                  (click)="activeTab.set('cash')"
                  [class]="getTabClass('cash')"
                  class="py-4 px-6 border-b-2 font-medium text-sm"
                >
                  Cash Management
                </button>
                <button
                  (click)="activeTab.set('dividends')"
                  [class]="getTabClass('dividends')"
                  class="py-4 px-6 border-b-2 font-medium text-sm"
                >
                  Dividends
                </button>
                <button
                  (click)="activeTab.set('history')"
                  [class]="getTabClass('history')"
                  class="py-4 px-6 border-b-2 font-medium text-sm"
                >
                  Price History
                </button>
              </nav>
            </div>

            <div class="p-6">
              @switch (activeTab()) {
                @case ('holdings') {
                  @if (nonCashStocks().length > 0) {
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead class="bg-slate-50">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allocation</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-slate-200">
                          @for (stock of nonCashStocks(); track stock.id) {
                            <tr class="hover:bg-slate-50">
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div class="text-sm font-medium text-slate-900">{{ stock.ticker }}</div>
                                  <div class="text-sm text-slate-500">{{ stock.name }}</div>
                                </div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-slate-900">
                                  ₹{{ stock.currentPrice | number: "1.2-2" }}
                                </div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                {{ stock.quantity || stock.shares | number: "1.0-0" }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                  <span class="text-sm text-slate-900">{{ stock.weight | number: "1.1-1" }}%</span>
                                  @if (stock.weight > portfolio()!.maxStockAllocationPercent) {
                                    <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Over Limit
                                    </span>
                                  }
                                </div>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                ₹{{ stock.totalValue | number: "1.0-0" }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex gap-2">
                                  <button
                                    (click)="viewStockHistory(stock)"
                                    class="text-blue-600 hover:text-blue-900"
                                  >
                                    History
                                  </button>
                                  <button class="text-red-600 hover:text-red-900">
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  } @else {
                    <div class="text-center py-12">
                      <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                      </svg>
                      <h3 class="text-lg font-medium text-slate-900 mb-2">No stocks added yet</h3>
                      <p class="text-slate-600 mb-4">Start building your portfolio by adding your first stock</p>
                      <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Add Your First Stock
                      </button>
                    </div>
                  }
                }
                @case ('cash') {
                  <app-cash-management
                    [portfolio]="portfolio"
                    (budgetUpdated)="handleBudgetUpdate($event)"
                    (cashStockCreated)="handleCashStockCreated()"
                  ></app-cash-management>
                }
                @case ('dividends') {
                  <app-dividend-tracker
                    [portfolioId]="portfolio()!.id!"
                    [stocks]="portfolioStocksSignal"
                    (dividendAdded)="handleDividendAdded($event)"
                  ></app-dividend-tracker>
                }
                @case ('history') {
                  @if (selectedStockForHistory()) {
                    <app-price-history
                      [stock]="selectedStockForHistory"
                    ></app-price-history>
                  } @else {
                    <div class="text-center py-12">
                      <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 0 00-2-2z" />
                      </svg>
                      <h3 class="text-lg font-medium text-slate-900 mb-2">Select a stock to view history</h3>
                      <p class="text-slate-600">Click on "History" next to any stock in the Holdings tab to view its price history</p>
                    </div>
                  }
                }
              }
            </div>
          </div>
        </div>

        <!-- Modals -->
        @if (showBatchPriceUpdate()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="max-w-4xl w-full mx-4">
              <app-batch-price-update
                [portfolioId]="portfolio()!.id!"
                [stocks]="portfolioStocksSignal"
                (priceUpdated)="handleBatchPriceUpdate($event)"
                (closed)="toggleBatchPriceUpdate()"
              ></app-batch-price-update>
            </div>
          </div>
        }

        @if (showEditForm()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <app-portfolio-edit-form
                [portfolio]="portfolio"
                (portfolioUpdated)="handlePortfolioUpdate($event)"
                (formClosed)="toggleEditMode()"
              ></app-portfolio-edit-form>
            </div>
          </div>
        }
      } @else {
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-slate-900 mb-4">Portfolio Not Found</h1>
            <button (click)="goBack()" class="text-blue-600 hover:text-blue-800">
              ← Back to Portfolios
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class PortfolioDetailEnhancedComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly portfolioService = inject(FirebasePortfolioService);
  private readonly calculationService = inject(PortfolioCalculationService);

  portfolio = signal<Portfolio | null>(null);
  activeTab = signal<'holdings' | 'cash' | 'dividends' | 'history'>('holdings');
  selectedStockForHistory = signal<any>(null);
  showBatchPriceUpdate = signal(false);
  showEditForm = signal(false);

  portfolioStocks = computed(() => {
    const p = this.portfolio();
    return p ? p.stocks : [];
  });

  portfolioStocksSignal = signal<Stock[]>([]);

  nonCashStocks = computed(() => {
    const p = this.portfolio();
    return p ? p.stocks.filter(stock => !stock.isCashStock) : [];
  });

  cashPosition = computed(() => {
    const p = this.portfolio();
    return p ? this.calculationService.calculateCashPosition(p) : {
      totalInvested: 0,
      availableCash: 0,
      cashAllocationPercent: 0
    };
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const portfolioId = params["id"];
      if (portfolioId) {
        this.loadPortfolio(portfolioId);
      }
    });
  }

  private async loadPortfolio(id: string): Promise<void> {
    const portfolio = this.portfolioService.getPortfolio(id);
    this.portfolio.set(portfolio as any || null);

    // Update the portfolioStocksSignal when portfolio changes
    if (portfolio) {
      this.portfolioStocksSignal.set(portfolio.stocks as any);
    }
  }

  getTabClass(tab: string): string {
    const isActive = this.activeTab() === tab;
    return isActive
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  toggleBatchPriceUpdate(): void {
    this.showBatchPriceUpdate.update(show => !show);
  }

  toggleEditMode(): void {
    this.showEditForm.update(show => !show);
  }

  viewStockHistory(stock: any): void {
    this.selectedStockForHistory.set(stock);
    this.activeTab.set('history');
  }

  handleBatchPriceUpdate(update: BatchPriceUpdateDto): void {
    console.log('Batch price update:', update);
    // Implement batch price update logic
    this.toggleBatchPriceUpdate();
  }

  handleDividendAdded(dividend: AddDividendDto): void {
    console.log('Dividend added:', dividend);
    // Implement dividend addition logic
  }

  handleBudgetUpdate(budgetUpdate: UpdatePortfolioBudgetDto): void {
    console.log('Budget update:', budgetUpdate);
    // Implement budget update logic
  }

  handleCashStockCreated(): void {
    console.log('Cash stock created');
    // Implement cash stock creation logic
  }

  handlePortfolioUpdate(portfolioUpdate: UpdatePortfolioDto): void {
    console.log('Portfolio update:', portfolioUpdate);
    // Implement portfolio update logic
    this.toggleEditMode();
  }

  rebalancePortfolio(): void {
    console.log('Rebalancing portfolio');
    // Implement rebalancing logic
  }

  formatPortfolioType(type: string): string {
    const types: Record<string, string> = {
      equity: 'Equity',
      debt: 'Debt',
      hybrid: 'Hybrid',
      index: 'Index',
      custom: 'Custom'
    };
    return types[type] || type;
  }

  formatRiskLevel(riskLevel: string): string {
    const levels: Record<string, string> = {
      conservative: 'Conservative',
      moderate: 'Moderate',
      aggressive: 'Aggressive',
      very_aggressive: 'Very Aggressive'
    };
    return levels[riskLevel] || riskLevel;
  }

  goBack(): void {
    this.router.navigate(["/dashboard"]);
  }
}
