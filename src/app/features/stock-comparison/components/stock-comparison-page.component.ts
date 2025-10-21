import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockComparisonSelectorComponent } from './stock-comparison-selector/stock-comparison-selector.component';
import { StockComparisonViewComponent } from './stock-comparison-view/stock-comparison-view.component';
import { GeminiComparisonService } from '../services/gemini-comparison.service';
import { StockComparisonService } from '../services/stock-comparison.service';
import { UserPreferencesService } from '../../settings/services/user-preferences.service';
import {
  ComparedStock,
  StockComparison,
  ComparisonAnalysis,
} from '../models/stock-comparison.model';

type ViewState = 'selector' | 'generating' | 'results';

@Component({
  selector: 'app-stock-comparison-page',
  standalone: true,
  imports: [
    CommonModule,
    StockComparisonSelectorComponent,
    StockComparisonViewComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        @switch (viewState()) {
          @case ('selector') {
            <app-stock-comparison-selector
              [minStocks]="2"
              [maxStocks]="5"
              (compare)="onCompare($event)"
            />
          }

          @case ('generating') {
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
              <svg
                class="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4"
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

              <h2 class="text-2xl font-bold text-slate-900 mb-2">
                Analyzing Stocks...
              </h2>
              <p class="text-slate-600 mb-4">
                Our AI is comparing {{ selectedStocks().length }} stocks across
                multiple categories
              </p>

              <div class="max-w-md mx-auto space-y-2 text-left">
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    @if (progress() >= 1) {
                      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    }
                  </div>
                  <span>Analyzing products and services</span>
                </div>

                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    @if (progress() >= 2) {
                      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      <div class="w-2 h-2 bg-blue-600 rounded-full" [class.animate-pulse]="progress() >= 1"></div>
                    }
                  </div>
                  <span>Evaluating financial stability</span>
                </div>

                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    @if (progress() >= 3) {
                      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      <div class="w-2 h-2 bg-blue-600 rounded-full" [class.animate-pulse]="progress() >= 2"></div>
                    }
                  </div>
                  <span>Assessing fundamentals</span>
                </div>

                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <div class="w-2 h-2 bg-blue-600 rounded-full" [class.animate-pulse]="progress() >= 3"></div>
                  </div>
                  <span>Generating recommendations</span>
                </div>
              </div>

              <p class="text-xs text-slate-500 mt-6">
                This may take 5-10 seconds...
              </p>
            </div>
          }

          @case ('results') {
            @if (currentComparison()) {
              <app-stock-comparison-view
                [comparisonData]="currentComparison()!"
                (save)="onSave($event)"
                (back)="onBack()"
              />
            }
          }
        }

        <!-- Error State -->
        @if (error()) {
          <div class="mt-4 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="font-semibold text-red-900 mb-1">
                  Comparison Failed
                </h3>
                <p class="text-sm text-red-800">{{ error() }}</p>
                <button
                  type="button"
                  (click)="retryComparison()"
                  class="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StockComparisonPageComponent {
  private geminiService = inject(GeminiComparisonService);
  private comparisonService = inject(StockComparisonService);
  private preferencesService = inject(UserPreferencesService);
  private router = inject(Router);

  viewState = signal<ViewState>('selector');
  selectedStocks = signal<ComparedStock[]>([]);
  currentComparison = signal<StockComparison | null>(null);
  error = signal<string | null>(null);
  progress = signal<number>(0);

  async onCompare(stocks: ComparedStock[]) {
    this.selectedStocks.set(stocks);
    this.viewState.set('generating');
    this.error.set(null);
    this.progress.set(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        this.progress.update((p) => Math.min(p + 1, 3));
      }, 2000);

      // Get user's comparison prompts
      const prompts = this.preferencesService.comparisonPrompts();

      // Generate comparison analysis
      const analysis = await this.geminiService.compareStocks(stocks, prompts);

      clearInterval(progressInterval);
      this.progress.set(4);

      // Calculate overall ratings
      const ratings: { [ticker: string]: number } = {};
      stocks.forEach((stock) => {
        ratings[stock.ticker] = this.comparisonService.calculateOverallRating(
          analysis,
          stock.ticker
        );
      });

      // Create comparison object
      const comparison: StockComparison = {
        id: '', // Will be set when saved
        userId: '', // Will be set by service
        stocks,
        analysis,
        ratings,
        createdAt: new Date(),
        updatedAt: new Date(),
        useCustomPrompts: false,
        generationMetadata: this.geminiService.lastGenerationMetadata || {
          model: 'gemini-1.5-flash-latest',
          temperature: 0.3,
          tokensUsed: 0,
          generationTime: 0,
          promptVersion: '1.0',
          timestamp: new Date(),
        },
      };

      this.currentComparison.set(comparison);
      this.viewState.set('results');
    } catch (err: any) {
      this.error.set(
        err.message || 'Failed to generate comparison. Please try again.'
      );
      this.viewState.set('selector');
    }
  }

  onSave(comparison: StockComparison) {
    // Comparison already saved by the view component
    // Navigate to history or show success message
    this.router.navigate(['/comparison-history']);
  }

  onBack() {
    this.viewState.set('selector');
    this.currentComparison.set(null);
  }

  retryComparison() {
    if (this.selectedStocks().length >= 2) {
      this.onCompare(this.selectedStocks());
    } else {
      this.viewState.set('selector');
    }
  }
}
