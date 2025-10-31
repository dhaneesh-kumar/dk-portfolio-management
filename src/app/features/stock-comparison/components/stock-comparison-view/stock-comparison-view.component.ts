import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  StockComparison,
  ComparisonAnalysis,
  ComparedStock,
  CategoryComparison,
} from '../../models/stock-comparison.model';
import { StockComparisonService } from '../../services/stock-comparison.service';
import { ComparisonCardComponent } from '../comparison-card/comparison-card.component';

@Component({
  selector: 'app-stock-comparison-view',
  standalone: true,
  imports: [CommonModule, ComparisonCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header with Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Comparison Results</h2>
          <p class="text-sm text-slate-600 mt-1">
            {{ comparison().stocks.length }} stocks analyzed
            @if (comparison().generationMetadata) {
              <span class="ml-2 text-slate-400">•</span>
              <span class="ml-2">{{ formatGenerationTime(comparison().generationMetadata.generationTime) }}</span>
            }
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          @if (!comparison().id) {
            <button
              type="button"
              (click)="onSave()"
              [disabled]="isSaving()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              @if (isSaving()) {
                Saving...
              } @else {
                Save Comparison
              }
            </button>
          }

          <button
            type="button"
            (click)="onBack()"
            class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 focus:ring-4 focus:ring-slate-200 transition-colors text-sm font-medium"
          >
            Back
          </button>
        </div>
      </div>

      <!-- Overall Summary -->
      @if (comparison().analysis.summary) {
        <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
          <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Overall Summary
          </h3>
          <p class="text-blue-800 text-sm leading-relaxed">{{ comparison().analysis.summary }}</p>
        </div>
      }

      <!-- Recommendation -->
      @if (comparison().analysis.recommendation) {
        <div class="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
          <h3 class="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recommendation
          </h3>
          <p class="text-green-800 text-sm leading-relaxed">{{ comparison().analysis.recommendation }}</p>
        </div>
      }

      <!-- Overall Ratings -->
      <div class="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Overall Ratings</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          @for (stock of comparison().stocks; track stock.ticker) {
            <div class="text-center p-4 bg-slate-50 rounded-lg">
              <div class="font-bold text-lg text-slate-900 mb-1">{{ stock.ticker }}</div>
              <div class="flex items-center justify-center gap-2">
                <span class="text-3xl font-bold text-blue-600">{{ getRating(stock.ticker) }}</span>
                <span class="text-lg text-slate-500">/10</span>
              </div>
              <div class="mt-2">
                {{ renderStars(getRating(stock.ticker)) }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Category Comparisons (Mobile: Accordion, Desktop: Side-by-side) -->

      <!-- Products & Services -->
      @if (comparison().analysis.productsAndServices) {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            (click)="toggleCategory('productsAndServices')"
            class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors"
          >
            <h3 class="text-lg font-semibold text-purple-900 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              Products & Services
            </h3>
            <svg
              class="w-5 h-5 text-purple-600 transition-transform"
              [class.rotate-180]="expandedCategories()['productsAndServices']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          @if (expandedCategories()['productsAndServices']) {
            <div class="p-6">
              <app-comparison-card [category]="comparison().analysis.productsAndServices!"></app-comparison-card>
            </div>
          }
        </div>
      }

      <!-- Financial Stability -->
      @if (comparison().analysis.financialStability) {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            (click)="toggleCategory('financialStability')"
            class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 transition-colors"
          >
            <h3 class="text-lg font-semibold text-emerald-900 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Financial Stability
            </h3>
            <svg
              class="w-5 h-5 text-emerald-600 transition-transform"
              [class.rotate-180]="expandedCategories()['financialStability']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          @if (expandedCategories()['financialStability']) {
            <div class="p-6">
              <app-comparison-card [category]="comparison().analysis.financialStability!"></app-comparison-card>
            </div>
          }
        </div>
      }

      <!-- Fundamentals -->
      @if (comparison().analysis.fundamentals) {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            (click)="toggleCategory('fundamentals')"
            class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-colors"
          >
            <h3 class="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Fundamentals
            </h3>
            <svg
              class="w-5 h-5 text-amber-600 transition-transform"
              [class.rotate-180]="expandedCategories()['fundamentals']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          @if (expandedCategories()['fundamentals']) {
            <div class="p-6">
              <app-comparison-card [category]="comparison().analysis.fundamentals!"></app-comparison-card>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class StockComparisonViewComponent {
  private comparisonService = inject(StockComparisonService);

  @Input() set comparisonData(value: StockComparison) {
    this.comparison.set(value);
  }

  @Output() save = new EventEmitter<StockComparison>();
  @Output() back = new EventEmitter<void>();

  comparison = signal<StockComparison>({} as StockComparison);
  expandedCategories = signal<{ [key: string]: boolean }>({
    productsAndServices: true,
    financialStability: false,
    fundamentals: false,
  });
  isSaving = signal(false);

  getRating(ticker: string): number {
    const ratings = this.comparison().ratings;
    return ratings?.[ticker] || 0;
  }

  toggleCategory(category: string) {
    this.expandedCategories.update((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  renderStars(rating: number): string {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      '⭐'.repeat(fullStars) +
      (halfStar ? '⭐' : '') +
      '☆'.repeat(emptyStars)
    );
  }

  formatGenerationTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  async onSave() {
    if (this.comparison().id) return; // Already saved

    this.isSaving.set(true);
    try {
      const id = await this.comparisonService.createComparison(
        this.comparison().stocks,
        this.comparison().analysis,
        this.comparison().ratings,
        this.comparison().generationMetadata,
        {
          customPrompts: this.comparison().customPrompts,
          useCustomPrompts: this.comparison().useCustomPrompts,
        }
      );

      // Update comparison with ID
      this.comparison.update((comp) => ({ ...comp, id }));
      this.save.emit(this.comparison());
    } catch (error) {
      console.error('Failed to save comparison:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  onBack() {
    this.back.emit();
  }
}
