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
} from "../services/stock-api.service";
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
  `,
})
export class StockSearchComponent {
  @Input() placeholder = "Search stocks...";
  @Input() initialValue = "";
  @Output() stockSelected = new EventEmitter<StockSearchResult>();
  @Output() searchQueryChange = new EventEmitter<string>();

  private stockApiService = inject(StockApiService);
  private searchSubject = new Subject<string>();

  searchQuery = "";
  searchResults = signal<StockSearchResult[]>([]);
  showDropdown = signal(false);
  isLoading = signal(false);

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
    this.stockSelected.emit(stock);
  }
}
