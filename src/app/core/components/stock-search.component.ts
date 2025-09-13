import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  effect,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  StockApiService,
  StockSearchResult,
  StockQuote,
} from "../../services/stock-api.service";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: "app-stock-search",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <label class="block text-sm font-medium text-slate-700 mb-2">
        Stock Ticker / Company Name
      </label>

      <div class="relative">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput($event)"
          (focus)="showDropdown.set(true)"
          class="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search stocks (e.g., RELIANCE, TCS, HDFC)"
          autocomplete="off"
        />

        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          @if (isLoading()) {
            <svg
              class="w-5 h-5 text-slate-400 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                opacity="0.25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z"
                opacity="0.75"
              />
            </svg>
          } @else {
            <svg
              class="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        </div>
      </div>

      <!-- Search Results Dropdown -->
      @if (
        showDropdown() &&
        (searchResults().length > 0 || (searchQuery && !isLoading()))
      ) {
        <div
          class="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          @if (searchResults().length > 0) {
            @for (stock of searchResults(); track stock.symbol) {
              <button
                type="button"
                (click)="selectStock(stock)"
                class="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-slate-900">
                      {{ stock.symbol }}
                    </div>
                    <div class="text-sm text-slate-600 truncate">
                      {{ stock.name }}
                    </div>
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ stock.exchange }}
                  </div>
                </div>
              </button>
            }
          } @else if (searchQuery && !isLoading()) {
            <div class="px-4 py-3 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                No stocks found for "{{ searchQuery }}"
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Try searching with the stock symbol (e.g., RELIANCE, TCS)
              </div>
            </div>
          }
        </div>
      }

      <!-- Quick Suggestions -->
      @if (!searchQuery && showDropdown()) {
        <div
          class="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg"
        >
          <div
            class="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-200"
          >
            Popular Indian Stocks
          </div>
          @for (stock of popularStocks; track stock.symbol) {
            <button
              type="button"
              (click)="selectStock(stock)"
              class="w-full px-4 py-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-slate-900">
                    {{ stock.symbol }}
                  </div>
                  <div class="text-sm text-slate-600 truncate">
                    {{ stock.name }}
                  </div>
                </div>
                <div class="text-xs text-slate-500">
                  {{ stock.exchange }}
                </div>
              </div>
            </button>
          }
        </div>
      }
    </div>

    <!-- Click outside handler -->
    @if (showDropdown()) {
      <div class="fixed inset-0 z-40" (click)="showDropdown.set(false)"></div>
    }

    <!-- Stock Data Preview Section -->
    @if (showStockPreview() && selectedStock()) {
      <div class="mt-4 bg-white border border-slate-300 rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ selectedStock()!.symbol }}</h3>
            <p class="text-sm text-slate-600">{{ selectedStock()!.name }}</p>
          </div>
          <button
            (click)="closeStockPreview()"
            class="text-slate-400 hover:text-slate-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (isLoadingStockData()) {
          <div class="flex items-center justify-center py-8">
            <div class="flex items-center space-x-2">
              <svg class="w-6 h-6 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z" opacity="0.75" />
              </svg>
              <span class="text-sm text-slate-600">🤖 Fetching data with Gemini AI...</span>
            </div>
          </div>
        } @else if (selectedStockData()) {
          <div class="space-y-6">
            <!-- Price Information -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-sm font-medium text-slate-600">Current Price</p>
                <p class="text-xl font-bold text-slate-900">
                  ₹{{ selectedStockData()!.price | number: "1.2-2" }}
                </p>
                <p class="text-sm" [class]="selectedStockData()!.change >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ selectedStockData()!.change >= 0 ? '+' : '' }}{{ selectedStockData()!.change | number: "1.2-2" }}
                  ({{ selectedStockData()!.changePercent | number: "1.2-2" }}%)
                </p>
              </div>
              
              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-sm font-medium text-slate-600">Market Cap</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ selectedStockData()!.marketCap ? '₹' + (selectedStockData()!.marketCap! / 10000000 | number: "1.0-0") + ' Cr' : 'N/A' }}
                </p>
              </div>

              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-sm font-medium text-slate-600">P/E Ratio</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ selectedStockData()!.pe ? (selectedStockData()!.pe | number: "1.1-1") : 'N/A' }}
                </p>
              </div>

              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-sm font-medium text-slate-600">EPS</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ selectedStockData()!.eps ? ('₹' + (selectedStockData()!.eps | number: "1.2-2")) : 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Enhanced Fundamentals (if available from Gemini) -->
            @if (selectedStockData()!.fundamentals) {
              <div class="border-t border-slate-200 pt-6">
                <h4 class="text-md font-semibold text-slate-900 mb-4">📊 Key Fundamentals</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-blue-600">ROE</p>
                    <p class="text-lg font-semibold text-blue-900">
                      {{ selectedStockData()!.fundamentals!.roe ? (selectedStockData()!.fundamentals!.roe + '%') : 'N/A' }}
                    </p>
                  </div>
                  
                  <div class="bg-green-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-green-600">Revenue</p>
                    <p class="text-lg font-semibold text-green-900">
                      {{ selectedStockData()!.fundamentals!.revenue ? '₹' + (selectedStockData()!.fundamentals!.revenue | number: "1.0-0") + ' Cr' : 'N/A' }}
                    </p>
                  </div>

                  <div class="bg-purple-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-purple-600">Debt/Equity</p>
                    <p class="text-lg font-semibold text-purple-900">
                      {{ selectedStockData()!.fundamentals!.debtToEquity ? (selectedStockData()!.fundamentals!.debtToEquity | number: "1.2-2") : 'N/A' }}
                    </p>
                  </div>

                  <div class="bg-yellow-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-yellow-600">Dividend Yield</p>
                    <p class="text-lg font-semibold text-yellow-900">
                      {{ selectedStockData()!.dividendYield ? (selectedStockData()!.dividendYield + '%') : 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- AI Analysis (if available from Gemini) -->
            @if (selectedStockData()!.analysis) {
              <div class="border-t border-slate-200 pt-6">
                <h4 class="text-md font-semibold text-slate-900 mb-4">🤖 AI Analysis</h4>
                
                <!-- Summary -->
                <div class="bg-blue-50 rounded-lg p-4 mb-4">
                  <p class="text-sm text-slate-700">{{ selectedStockData()!.analysis!.summary }}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <!-- Strengths -->
                  <div class="bg-green-50 rounded-lg p-4">
                    <h5 class="text-sm font-semibold text-green-800 mb-2">✅ Strengths</h5>
                    <ul class="space-y-1">
                      @for (strength of selectedStockData()!.analysis!.strengths; track strength) {
                        <li class="text-sm text-green-700">• {{ strength }}</li>
                      }
                    </ul>
                  </div>

                  <!-- Risks -->
                  <div class="bg-red-50 rounded-lg p-4">
                    <h5 class="text-sm font-semibold text-red-800 mb-2">⚠️ Risks</h5>
                    <ul class="space-y-1">
                      @for (risk of selectedStockData()!.analysis!.risks; track risk) {
                        <li class="text-sm text-red-700">• {{ risk }}</li>
                      }
                    </ul>
                  </div>
                </div>

                <!-- Recommendation -->
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <span class="text-sm font-medium text-slate-700">AI Recommendation:</span>
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-semibold"
                    [class]="getRecommendationClass(selectedStockData()!.analysis!.recommendation)"
                  >
                    {{ selectedStockData()!.analysis!.recommendation }}
                  </span>
                </div>
              </div>
            }

            <!-- Add to Portfolio Button -->
            <div class="border-t border-slate-200 pt-6">
              <button
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Portfolio
              </button>
            </div>
          </div>
        } @else {
          <div class="text-center py-8">
            <p class="text-sm text-slate-600">Unable to load stock data. Please try again.</p>
          </div>
        }
      </div>
    }
  `,
})
export class StockSearchComponent {
  @Input() placeholder = "Search stocks...";
  @Input() initialValue = "";
  @Output() stockSelected = new EventEmitter<StockSearchResult>();
  @Output() stockDataSelected = new EventEmitter<StockQuote>();
  @Output() searchQueryChange = new EventEmitter<string>();

  private stockApiService = inject(StockApiService);
  private searchSubject = new Subject<string>();

  searchQuery = "";
  searchResults = signal<StockSearchResult[]>([]);
  showDropdown = signal(false);
  isLoading = signal(false);
  
  // Enhanced stock data display
  selectedStock = signal<StockSearchResult | null>(null);
  selectedStockData = signal<StockQuote | null>(null);
  isLoadingStockData = signal(false);
  showStockPreview = signal(false);

  popularStocks: StockSearchResult[] = [];

  constructor() {
    // Initialize search query
    this.searchQuery = this.initialValue;  

    // Setup search with debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.isLoading.set(false);
            return [];
          }
          this.isLoading.set(true);
          return this.stockApiService.searchStocks(query);
        }),
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error("Search error:", error);
          this.searchResults.set([]);
          this.isLoading.set(false);
        },
      });
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchQueryChange.emit(query);

    if (query.length < 2) {
      this.searchResults.set([]);
      this.isLoading.set(false);
    } else {
      this.searchSubject.next(query);
    }
  }

  selectStock(stock: StockSearchResult): void {
    this.searchQuery = stock.symbol;
    this.showDropdown.set(false);
    this.selectedStock.set(stock);
    this.loadStockData(stock.symbol);
    this.stockSelected.emit(stock);
  }

  private loadStockData(symbol: string): void {
    this.isLoadingStockData.set(true);
    this.showStockPreview.set(true);
    
    this.stockApiService.getStockQuote(symbol).subscribe({
      next: (stockData) => {
        this.selectedStockData.set(stockData);
        this.isLoadingStockData.set(false);
        if (stockData) {
          this.stockDataSelected.emit(stockData);
        }
      },
      error: (error) => {
        console.error('Error loading stock data:', error);
        this.isLoadingStockData.set(false);
        this.selectedStockData.set(null);
      }
    });
  }

  closeStockPreview(): void {
    this.showStockPreview.set(false);
    this.selectedStock.set(null);
    this.selectedStockData.set(null);
  }

  getRecommendationClass(recommendation: string): string {
    switch (recommendation) {
      case 'BUY':
        return 'bg-green-100 text-green-800';
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'SELL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
