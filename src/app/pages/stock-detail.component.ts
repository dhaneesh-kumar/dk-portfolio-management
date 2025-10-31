import { Component, inject, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { FirebasePortfolioService } from "../services/firebase-portfolio.service";
import { StockApiService } from "../services/stock-api.service";
import { Stock, StockNote } from "../models/portfolio.model";
import { EnhancedNotesComponent } from "../shared/components/enhanced-notes/enhanced-notes.component";
import { StockComparisonSelectorComponent } from "../features/stock-comparison/components/stock-comparison-selector/stock-comparison-selector.component";
import { ComparedStock } from "../features/stock-comparison/models/stock-comparison.model";

@Component({
  selector: "app-stock-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnhancedNotesComponent, StockComparisonSelectorComponent],
  template: `
    @if (stock() && portfolio()) {
      <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center gap-4">
              <button
                (click)="goBack()"
                class="text-slate-400 hover:text-slate-600"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 class="text-3xl font-bold text-slate-900">
                  {{ stock()!.ticker }}
                </h1>
                <p class="text-slate-600 mt-1">{{ stock()!.name }}</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Tab Navigation -->
        <div class="bg-white border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="flex space-x-8" aria-label="Tabs">
              <button
                (click)="activeTab.set('overview')"
                [class]="activeTab() === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="border-b-2 py-4 px-1 text-sm font-medium transition-colors"
              >
                Overview
              </button>
              <button
                (click)="activeTab.set('compare')"
                [class]="activeTab() === 'compare' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                class="border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Compare
              </button>
            </nav>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Overview Tab -->
          @if (activeTab() === 'overview') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Market Data Column -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Price Overview -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h2 class="text-xl font-bold text-slate-900 mb-4">
                  Market Data
                </h2>

                @if (stock()!.marketData) {
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-slate-900">
                        ₹{{ stock()!.marketData!.price | number: "1.2-2" }}
                      </div>
                      <div class="text-sm text-slate-500">Current Price</div>
                      <div
                        class="mt-1"
                        [class]="
                          stock()!.marketData!.changePercent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        "
                      >
                        {{ stock()!.marketData!.changePercent >= 0 ? "+" : ""
                        }}{{ stock()!.marketData!.changePercent }}%
                      </div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        {{ stock()!.marketData!.pe | number: "1.1-1" }}
                      </div>
                      <div class="text-sm text-slate-500">P/E Ratio</div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        ₹{{ stock()!.marketData!.eps | number: "1.1-1" }}
                      </div>
                      <div class="text-sm text-slate-500">EPS</div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        {{
                          stock()!.marketData!.dividendYield | number: "1.2-2"
                        }}%
                      </div>
                      <div class="text-sm text-slate-500">Dividend Yield</div>
                    </div>
                  </div>

                  <div
                    class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200"
                  >
                    <div>
                      <div class="text-sm text-slate-500">Book Value</div>
                      <div class="text-lg font-semibold text-slate-900">
                        ₹{{ stock()!.marketData!.bookValue | number: "1.2-2" }}
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Market Cap</div>
                      <div class="text-lg font-semibold text-slate-900">
                        ���{{
                          stock()!.marketData!.marketCap / 10000000
                            | number: "1.0-0"
                        }}Cr
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Debt Ratio</div>
                      <div class="text-lg font-semibold text-slate-900">
                        {{ stock()!.marketData!.debt | number: "1.1-1" }}
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Volume</div>
                      <div class="text-lg font-semibold text-slate-900">
                        {{
                          stock()!.marketData!.volume / 100000
                            | number: "1.0-0"
                        }}L
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <svg
                      class="w-16 h-16 text-slate-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                      />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-900 mb-2">
                      Loading Market Data...
                    </h3>
                    <p class="text-slate-600 mb-4">
                      Fetching real-time market data for {{ stock()!.ticker }}
                    </p>
                    <button
                      (click)="refreshMarketData()"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <svg
                        class="w-4 h-4 inline-block mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh Data
                    </button>
                  </div>
                }
              </div>

              <!-- Enhanced Personal Notes -->
              <app-enhanced-notes
                [notes]="enhancedNotes()"
                (noteAdded)="onNoteAdded($event)"
                (noteUpdated)="onNoteUpdated($event)"
                (noteDeleted)="onNoteDeleted($event)"
              ></app-enhanced-notes>
            </div>

            <!-- Holdings Info Sidebar -->
            <div class="space-y-6">
              <!-- Position Summary -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h2 class="text-xl font-bold text-slate-900 mb-4">
                  Your Position
                </h2>

                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Shares Owned</span>
                    <span class="font-semibold">{{ stock()!.shares }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-slate-600">Avg. Price</span>
                    <span class="font-semibold"
                      >₹{{ stock()!.currentPrice | number: "1.2-2" }}</span
                    >
                  </div>

                  <div class="flex justify-between">
                    <span class="text-slate-600">Total Value</span>
                    <span class="font-semibold"
                      >₹{{ stock()!.totalValue | number: "1.0-0" }}</span
                    >
                  </div>

                  <div class="flex justify-between border-t pt-4">
                    <span class="text-slate-600">Portfolio Weight</span>
                    <span class="font-semibold">{{ stock()!.weight }}%</span>
                  </div>
                </div>
              </div>

              <!-- Quick Note Sections -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h3 class="font-semibold text-slate-900 mb-4">
                  Quick Add Notes
                </h3>
                <div class="space-y-2">
                  @for (section of commonNoteSections(); track section) {
                    <button
                      (click)="startQuickNote(section)"
                      class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {{ section }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
          }

          <!-- Compare Tab -->
          @if (activeTab() === 'compare') {
            <div>
              <app-stock-comparison-selector
                [minStocks]="2"
                [maxStocks]="5"
                [preSelectedStocks]="currentStockAsComparedStock()"
                (compare)="onCompareStocks($event)"
              />
            </div>
          }
        </div>


      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-slate-900 mb-4">
            Stock Not Found
          </h1>
          <a routerLink="/dashboard" class="text-blue-600 hover:text-blue-800"
            >← Back to Portfolios</a
          >
        </div>
      </div>
    }
  `,
})
export class StockDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolioService = inject(FirebasePortfolioService);
  private stockApiService = inject(StockApiService);

  stockId = signal<string>("");
  portfolioId = signal<string>("");
  refreshTrigger = signal<number>(0);
  activeTab = signal<'overview' | 'compare'>('overview');

  portfolio = computed(() => {
    const pId = this.portfolioId();
    this.refreshTrigger(); // Force dependency on refresh trigger
    const allPortfolios = this.portfolioService.getPortfolios(); // Direct dependency on portfolios signal
    return pId ? allPortfolios().find((p: any) => p.id === pId) : null;
  });

  stock = computed(() => {
    const p = this.portfolio();
    const sId = this.stockId();
    return p && sId ? p.stocks.find((s: any) => s.id === sId) : null;
  });

  isLoadingMarketData = signal(false);

  // Convert stock notes to enhanced notes format
  enhancedNotes = computed(() => {
    const currentStock = this.stock();
    console.log('enhancedNotes computed - stock:', currentStock?.ticker, 'notes count:', currentStock?.notes.length);
    if (!currentStock) return [];

    const notes = currentStock.notes.map((note: any) => ({
      id: note.id,
      section: note.section,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      authorId: note.authorId,
      authorEmail: note.authorEmail
    }));

    console.log('enhancedNotes computed - returning notes:', notes.map((n: any) => ({ id: n.id, section: n.section,  content: n.content })));
    return notes;
  });

  commonNoteSections = this.stockApiService.commonNoteSections;

  // Prepare current stock for comparison
  currentStockAsComparedStock = computed(() => {
    const currentStock = this.stock();
    if (!currentStock || !currentStock.marketData) return [];

    const comparedStock: ComparedStock = {
      ticker: currentStock.ticker,
      name: currentStock.name,
      currentPrice: currentStock.marketData.price,
      marketData: {
        price: currentStock.marketData.price,
        change: currentStock.marketData.change || 0,
        changePercent: currentStock.marketData.changePercent || 0,
        marketCap: currentStock.marketData.marketCap,
        pe: currentStock.marketData.pe,
        eps: currentStock.marketData.eps,
        dividendYield: currentStock.marketData.dividendYield,
        debtToEquity: currentStock.marketData.debt,
        roe: currentStock.marketData.roe,
        bookValue: currentStock.marketData.bookValue,
      },
    };

    return [comparedStock];
  });

  constructor() {
    this.route.params.subscribe((params) => {
      this.stockId.set(params["id"]);
    });

    this.route.queryParams.subscribe((params) => {
      if (params["portfolio"]) {
        this.portfolioId.set(params["portfolio"]);
      }
    });

    // Auto-fetch market data when stock is loaded
    effect(() => {
      const currentStock = this.stock();
      if (currentStock && !currentStock.marketData) {
        this.fetchMarketData();
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  startQuickNote(section: string): void {
    // This method can be removed or used for backward compatibility
  }

  async onNoteAdded(noteData: { section: string; content: string }): Promise<void> {
    console.log('onNoteAdded called:', noteData);
    const result = await this.portfolioService.addStockNote(
      this.portfolioId(),
      this.stockId(),
      noteData.section,
      noteData.content,
    );

    console.log('addStockNote result:', result);
    if (result) {
      // Force UI refresh
      this.refreshTrigger.update(val => val + 1);
    } else {
      console.error('Failed to add note');
    }
  }

  async onNoteUpdated(noteData: { id: string; section: string; content: string }): Promise<void> {
    console.log('onNoteUpdated called:', noteData);
    const portfolio = this.portfolio();
    const stock = this.stock();

    if (portfolio && stock) {
      const noteIndex = stock.notes.findIndex((n: any) => n.id === noteData.id);
      if (noteIndex !== -1) {
        console.log('Found note to update at index:', noteIndex);
        // Create a new portfolio object to trigger reactivity
        const updatedPortfolio = {
          ...portfolio,
          stocks: portfolio.stocks.map((s: any) =>
            s.id === stock.id
              ? {
                  ...s,
                  notes: s.notes.map((n: any) =>
                    n.id === noteData.id
                      ? {
                          ...n,
                          section: noteData.section,
                          content: noteData.content,
                          updatedAt: new Date()
                        }
                      : n
                  )
                }
              : s
          )
        };

        const result = await this.portfolioService.updatePortfolio(updatedPortfolio);
        console.log('updatePortfolio result:', result);
        if (result) {
          // Force UI refresh
          this.refreshTrigger.update(val => val + 1);
        }
      }
    }
  }

  async onNoteDeleted(noteId: string): Promise<void> {
    this.deleteNote(noteId);
  }

  async deleteNote(noteId: string): Promise<void> {
    console.log('deleteNote called:', noteId);
    const portfolio = this.portfolio();
    const stock = this.stock();
    if (portfolio && stock) {
      console.log('Found portfolio and stock for deletion');
      // Create a new portfolio object to trigger reactivity
      const updatedPortfolio = {
        ...portfolio,
        stocks: portfolio.stocks.map((s: any) =>
          s.id === stock.id
            ? {
                ...s,
                notes: s.notes.filter((n: any) => n.id !== noteId)
              }
            : s
        )
      };

      const result = await this.portfolioService.updatePortfolio(updatedPortfolio);
      console.log('deleteNote updatePortfolio result:', result);
      if (result) {
        // Force UI refresh
        this.refreshTrigger.update(val => val + 1);
      }
    }
  }

  async fetchMarketData(): Promise<void> {
    const currentStock = this.stock();
    if (!currentStock || this.isLoadingMarketData()) return;

    this.isLoadingMarketData.set(true);

    try {
      this.stockApiService.getStockQuote(currentStock.ticker).subscribe({
        next: async (quote) => {
          if (quote) {
            const marketData = this.stockApiService.convertToMarketData(quote);
            await this.portfolioService.updateStockMarketData(
              this.portfolioId(),
              currentStock.ticker,
              marketData,
            );
          }
          this.isLoadingMarketData.set(false);
        },
        error: (error) => {
          console.error("Failed to fetch market data:", error);
          this.isLoadingMarketData.set(false);
        },
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      this.isLoadingMarketData.set(false);
    }
  }

  async refreshMarketData(): Promise<void> {
    await this.fetchMarketData();
  }

  onCompareStocks(stocks: ComparedStock[]): void {
    // When user clicks "Compare" in the selector, navigate to comparison page
    // The comparison page will handle the actual comparison
    this.router.navigate(['/stock-comparison'], {
      state: { preSelectedStocks: stocks }
    });
  }
}
