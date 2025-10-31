import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockApiService, StockSearchResult } from '../../../../services/stock-api.service';
import { ComparedStock, MarketDataSnapshot } from '../../models/stock-comparison.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-stock-comparison-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Stock Comparison</h2>
          <p class="text-sm text-slate-600 mt-1">
            Select {{ minStocks }}-{{ maxStocks }} stocks to compare
            ({{ selectedStocks().length }}/{{ maxStocks }} selected)
          </p>
        </div>

        @if (selectedStocks().length >= minStocks) {
          <button
            type="button"
            (click)="onCompare()"
            [disabled]="isComparing()"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isComparing()) {
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z" opacity="0.75"/>
                </svg>
                Comparing...
              </span>
            } @else {
              Compare Stocks
            }
          </button>
        }
      </div>

      <!-- Search Input -->
      <div class="relative">
        <label class="block text-sm font-medium text-slate-700 mb-2">
          Search and Add Stocks
        </label>

        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput($event)"
            (focus)="showDropdown.set(true)"
            [disabled]="selectedStocks().length >= maxStocks"
            class="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
            placeholder="Search stocks (e.g., RELIANCE, TCS, HDFC)"
            autocomplete="off"
          />

          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            @if (isSearching()) {
              <svg class="w-5 h-5 text-slate-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z" opacity="0.75"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            }
          </div>
        </div>

        <!-- Search Results Dropdown -->
        @if (showDropdown() && searchResults().length > 0) {
          <div class="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            @for (stock of searchResults(); track stock.symbol) {
              @if (!isStockSelected(stock.symbol)) {
                <button
                  type="button"
                  (click)="addStock(stock)"
                  class="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium text-slate-900">{{ stock.symbol }}</div>
                      <div class="text-sm text-slate-600">{{ stock.name }}</div>
                    </div>
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </div>
                </button>
              }
            }
          </div>
        }
      </div>

      <!-- Selected Stocks -->
      @if (selectedStocks().length > 0) {
        <div>
          <h3 class="text-sm font-medium text-slate-700 mb-3">Selected Stocks</h3>

          <!-- Mobile: Vertical Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (stock of selectedStocks(); track stock.ticker) {
              <div class="bg-white border-2 border-blue-200 rounded-lg p-4 relative">
                <!-- Remove Button -->
                <button
                  type="button"
                  (click)="removeStock(stock.ticker)"
                  class="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove stock"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>

                <!-- Stock Info -->
                <div class="pr-8">
                  <div class="font-bold text-lg text-slate-900">{{ stock.ticker }}</div>
                  <div class="text-sm text-slate-600 mb-3">{{ stock.name }}</div>

                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600">Price:</span>
                      <span class="font-medium text-slate-900">₹{{ stock.currentPrice.toFixed(2) }}</span>
                    </div>

                    @if (stock.marketData.changePercent !== undefined) {
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-600">Change:</span>
                        <span [class]="stock.marketData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
                          {{ stock.marketData.changePercent >= 0 ? '+' : '' }}{{ stock.marketData.changePercent.toFixed(2) }}%
                        </span>
                      </div>
                    }

                    @if (stock.marketData.pe) {
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-600">P/E:</span>
                        <span class="font-medium text-slate-900">{{ stock.marketData.pe.toFixed(2) }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Add More Button (if under max) -->
          @if (selectedStocks().length < maxStocks) {
            <div class="mt-4 text-center">
              <p class="text-sm text-slate-600">
                You can add {{ maxStocks - selectedStocks().length }} more stock{{ maxStocks - selectedStocks().length > 1 ? 's' : '' }}
              </p>
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        <div class="text-center py-12 px-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <svg class="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 class="text-lg font-medium text-slate-900 mb-2">No stocks selected</h3>
          <p class="text-sm text-slate-600">
            Search and add {{ minStocks }}-{{ maxStocks }} stocks to start comparing
          </p>
        </div>
      }
    </div>
  `,
})
export class StockComparisonSelectorComponent {
  private stockApiService = inject(StockApiService);

  @Input() minStocks = 2;
  @Input() maxStocks = 5;
  @Input() preSelectedStocks: ComparedStock[] = [];

  @Output() compare = new EventEmitter<ComparedStock[]>();
  @Output() stocksChanged = new EventEmitter<ComparedStock[]>();

  // State
  selectedStocks = signal<ComparedStock[]>([]);
  searchQuery = '';
  searchResults = signal<StockSearchResult[]>([]);
  showDropdown = signal(false);
  isSearching = signal(false);
  isComparing = signal(false);

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor() {
    // Initialize with pre-selected stocks
    effect(() => {
      if (this.preSelectedStocks.length > 0) {
        this.selectedStocks.set([...this.preSelectedStocks]);
      }
    }, { allowSignalWrites: true });

    // Setup debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.searchResults.set([]);
            return [];
          }

          this.isSearching.set(true);
          return this.stockApiService.searchStocks(query);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearching.set(false);
        },
        error: (error) => {
          console.error('Search failed:', error);
          this.searchResults.set([]);
          this.isSearching.set(false);
        },
      });

    // Close dropdown on click outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          this.showDropdown.set(false);
        }
      });
    }
  }

  onSearchInput(event: any) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  async addStock(searchResult: StockSearchResult) {
    if (this.selectedStocks().length >= this.maxStocks) {
      return;
    }

    if (this.isStockSelected(searchResult.symbol)) {
      return;
    }

    try {
      this.isSearching.set(true);

      // Fetch full stock data
      const quote = await this.stockApiService.getStockQuote(searchResult.symbol).toPromise();

      if (!quote) {
        throw new Error('Stock data not available');
      }

      const comparedStock: ComparedStock = {
        ticker: quote.symbol,
        name: searchResult.name,
        currentPrice: quote.price,
        marketData: {
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          marketCap: quote.marketCap,
          pe: quote.pe,
          eps: quote.eps,
          dividendYield: quote.dividendYield,
          debtToEquity: quote.fundamentals?.debtToEquity,
          roe: quote.fundamentals?.roe,
          bookValue: quote.bookValue,
        },
      };

      this.selectedStocks.update((stocks) => [...stocks, comparedStock]);
      this.stocksChanged.emit(this.selectedStocks());

      // Clear search
      this.searchQuery = '';
      this.searchResults.set([]);
      this.showDropdown.set(false);
    } catch (error) {
      console.error('Failed to add stock:', error);
    } finally {
      this.isSearching.set(false);
    }
  }

  removeStock(ticker: string) {
    this.selectedStocks.update((stocks) =>
      stocks.filter((s) => s.ticker !== ticker)
    );
    this.stocksChanged.emit(this.selectedStocks());
  }

  isStockSelected(ticker: string): boolean {
    return this.selectedStocks().some((s) => s.ticker === ticker);
  }

  onCompare() {
    if (
      this.selectedStocks().length >= this.minStocks &&
      this.selectedStocks().length <= this.maxStocks
    ) {
      this.isComparing.set(true);
      this.compare.emit(this.selectedStocks());
    }
  }

  resetSelection() {
    this.selectedStocks.set([]);
    this.searchQuery = '';
    this.searchResults.set([]);
    this.isComparing.set(false);
    this.stocksChanged.emit([]);
  }
}
