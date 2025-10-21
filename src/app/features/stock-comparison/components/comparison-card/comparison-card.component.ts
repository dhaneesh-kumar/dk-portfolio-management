import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CategoryComparison,
  StockInsight,
} from '../../models/stock-comparison.model';

@Component({
  selector: 'app-comparison-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Category Description -->
      @if (category.description) {
        <p class="text-sm text-slate-700 italic border-l-4 border-slate-300 pl-4 py-2">
          {{ category.description }}
        </p>
      }

      <!-- Winner Badge -->
      @if (category.winner) {
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="font-medium text-slate-900">
            Best in category: <span class="text-blue-600 font-bold">{{ category.winner }}</span>
          </span>
        </div>
      }

      <!-- Stock Insights Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (ticker of getStockTickers(); track ticker) {
          @if (category.stockInsights[ticker]) {
            <div class="bg-slate-50 rounded-lg p-4 border-2 transition-all"
                 [class.border-yellow-400]="ticker === category.winner"
                 [class.border-slate-200]="ticker !== category.winner">
              <!-- Stock Header -->
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-bold text-slate-900">{{ ticker }}</h4>
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold"
                        [class.text-green-600]="category.stockInsights[ticker].score >= 7"
                        [class.text-yellow-600]="category.stockInsights[ticker].score >= 5 && category.stockInsights[ticker].score < 7"
                        [class.text-red-600]="category.stockInsights[ticker].score < 5">
                    {{ category.stockInsights[ticker].score.toFixed(1) }}
                  </span>
                  <span class="text-sm text-slate-500">/10</span>
                </div>
              </div>

              <!-- Score Bar -->
              <div class="mb-3">
                <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full transition-all duration-500"
                       [style.width.%]="category.stockInsights[ticker].score * 10"
                       [class.bg-green-500]="category.stockInsights[ticker].score >= 7"
                       [class.bg-yellow-500]="category.stockInsights[ticker].score >= 5 && category.stockInsights[ticker].score < 7"
                       [class.bg-red-500]="category.stockInsights[ticker].score < 5">
                  </div>
                </div>
              </div>

              <!-- Highlights -->
              @if (category.stockInsights[ticker].highlights && category.stockInsights[ticker].highlights.length > 0) {
                <div class="mb-3">
                  <h5 class="text-xs font-semibold text-slate-600 uppercase mb-2">Key Points</h5>
                  <ul class="space-y-1">
                    @for (highlight of category.stockInsights[ticker].highlights; track highlight) {
                      <li class="text-sm text-slate-700 flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span>{{ highlight }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Detailed Analysis (Expandable) -->
              @if (category.stockInsights[ticker].analysis) {
                <details class="group">
                  <summary class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2">
                    <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    Detailed Analysis
                  </summary>
                  <div class="mt-3 text-sm text-slate-700 leading-relaxed pl-6 border-l-2 border-blue-200">
                    {{ category.stockInsights[ticker].analysis }}
                  </div>
                </details>
              }

              <!-- Winner Badge -->
              @if (ticker === category.winner) {
                <div class="mt-3 pt-3 border-t border-yellow-300">
                  <span class="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Category Leader
                  </span>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ComparisonCardComponent {
  @Input() category!: CategoryComparison;

  getStockTickers(): string[] {
    if (!this.category || !this.category.stockInsights) {
      return [];
    }
    return Object.keys(this.category.stockInsights);
  }
}
