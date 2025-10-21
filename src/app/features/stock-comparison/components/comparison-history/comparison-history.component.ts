import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockComparisonService } from '../../services/stock-comparison.service';
import { StockComparison } from '../../models/stock-comparison.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-comparison-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Comparison History</h1>
            <p class="text-sm text-slate-600 mt-1">
              View and manage your saved stock comparisons
            </p>
          </div>

          <button
            type="button"
            (click)="createNewComparison()"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors"
          >
            + New Comparison
          </button>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg class="w-12 h-12 mx-auto text-slate-400 animate-spin mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z" opacity="0.75"/>
            </svg>
            <p class="text-slate-600">Loading comparisons...</p>
          </div>
        }

        <!-- Comparisons List -->
        @if (!isLoading() && comparisons().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (comparison of comparisons(); track comparison.id) {
              <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-slate-900 truncate">
                        {{ comparison.title || formatStockTickers(comparison.stocks) }}
                      </h3>
                      <p class="text-xs text-slate-600 mt-1">
                        {{ formatDate(comparison.createdAt) }}
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="deleteComparison(comparison.id, $event)"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete comparison"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-4 space-y-3">
                  <!-- Stock Tags -->
                  <div class="flex flex-wrap gap-2">
                    @for (stock of comparison.stocks; track stock.ticker) {
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ stock.ticker }}
                      </span>
                    }
                  </div>

                  <!-- Ratings Preview -->
                  @if (comparison.ratings && Object.keys(comparison.ratings).length > 0) {
                    <div class="space-y-2">
                      <p class="text-xs font-medium text-slate-600 uppercase">Ratings</p>
                      <div class="grid grid-cols-2 gap-2">
                        @for (ticker of getTopRatings(comparison.ratings); track ticker) {
                          <div class="flex items-center justify-between text-sm">
                            <span class="text-slate-700">{{ ticker }}</span>
                            <span class="font-bold text-blue-600">{{ comparison.ratings[ticker].toFixed(1) }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Summary Preview -->
                  @if (comparison.analysis?.summary) {
                    <p class="text-sm text-slate-600 line-clamp-2">
                      {{ comparison.analysis.summary }}
                    </p>
                  }

                  <!-- Metadata -->
                  <div class="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    @if (comparison.generationMetadata) {
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        {{ comparison.generationMetadata.tokensUsed }} tokens
                      </span>
                    }

                    @if (comparison.useCustomPrompts) {
                      <span class="inline-flex items-center gap-1 text-purple-600">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                        </svg>
                        Custom
                      </span>
                    }
                  </div>
                </div>

                <!-- Actions -->
                <div class="p-4 bg-slate-50 border-t border-slate-200">
                  <button
                    type="button"
                    (click)="viewComparison(comparison.id)"
                    class="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading() && comparisons().length === 0) {
          <div class="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg class="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <h3 class="text-xl font-semibold text-slate-900 mb-2">
              No comparisons yet
            </h3>
            <p class="text-slate-600 mb-6 max-w-md mx-auto">
              Start comparing stocks to see detailed AI-powered analysis and save your insights for future reference.
            </p>
            <button
              type="button"
              (click)="createNewComparison()"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors"
            >
              Create Your First Comparison
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ComparisonHistoryComponent implements OnInit {
  private comparisonService = inject(StockComparisonService);
  private router = inject(Router);

  comparisons = signal<StockComparison[]>([]);
  isLoading = signal(false);

  async ngOnInit() {
    await this.loadComparisons();
  }

  async loadComparisons() {
    this.isLoading.set(true);
    try {
      const data = await this.comparisonService.getUserComparisons();
      this.comparisons.set(data);
    } catch (error) {
      console.error('Failed to load comparisons:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatStockTickers(stocks: any[]): string {
    return stocks.map((s) => s.ticker).join(' vs ');
  }

  formatDate(date: Date | Timestamp): string {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getTopRatings(ratings: { [ticker: string]: number }): string[] {
    return Object.keys(ratings).slice(0, 3);
  }

  viewComparison(id: string) {
    // Navigate to comparison view
    this.router.navigate(['/comparison', id]);
  }

  async deleteComparison(id: string, event: Event) {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this comparison?')) {
      return;
    }

    try {
      const success = await this.comparisonService.deleteComparison(id);
      if (success) {
        await this.loadComparisons();
      }
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    }
  }

  createNewComparison() {
    this.router.navigate(['/stock-comparison']);
  }
}
