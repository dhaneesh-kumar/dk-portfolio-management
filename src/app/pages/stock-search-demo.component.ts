import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockSearchComponent } from '../core/components/stock-search.component';
import { StockSearchResult, StockQuote } from '../services/stock-api.service';

@Component({
  selector: 'app-stock-search-demo',
  standalone: true,
  imports: [CommonModule, StockSearchComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div class="max-w-4xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">
            🤖 Gemini AI Stock Analysis Demo
          </h1>
          <p class="text-slate-600">
            Search for Indian stocks and see AI-powered fundamental analysis and recommendations
          </p>
        </header>

        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-slate-900 mb-4">Stock Search</h2>
          <app-stock-search
            placeholder="Search for Indian stocks (e.g., RELIANCE, TCS, HDFCBANK)"
            (stockSelected)="onStockSelected($event)"
            (stockDataSelected)="onStockDataSelected($event)"
          ></app-stock-search>
        </div>

        <!-- Instructions -->
        @if (!lastSelectedStock && !lastSelectedStockData) {
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">🎯 How to Test</h3>
            <ol class="list-decimal list-inside space-y-2 text-blue-800">
              <li>Search for a stock symbol (e.g., "RELIANCE", "TCS", "HDFCBANK")</li>
              <li>Click on a stock from the dropdown to select it</li>
              <li>Watch as Gemini AI fetches comprehensive stock analysis</li>
              <li>Review the AI-generated fundamental data, analysis, and recommendation</li>
            </ol>
            
            <div class="mt-4 p-4 bg-white rounded border-l-4 border-yellow-400">
              <p class="text-sm text-slate-700">
                <strong>Note:</strong> To use live Gemini AI analysis, you need to:
              </p>
              <ul class="list-disc list-inside text-sm text-slate-600 mt-2">
                <li>Get a Gemini API key from Google AI Studio</li>
                <li>Update <code>environment.geminiApiKey</code> in the environment files</li>
                <li>Without the API key, the demo will show enhanced fallback data</li>
              </ul>
            </div>
          </div>
        }

        <!-- Debug Information -->
        @if (lastSelectedStock || lastSelectedStockData) {
          <div class="bg-slate-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">📊 Debug Information</h3>
            
            @if (lastSelectedStock) {
              <div class="mb-4">
                <h4 class="font-medium text-slate-700 mb-2">Selected Stock:</h4>
                <pre class="bg-white p-3 rounded text-sm overflow-x-auto">{{ lastSelectedStock | json }}</pre>
              </div>
            }
            
            @if (lastSelectedStockData) {
              <div>
                <h4 class="font-medium text-slate-700 mb-2">Stock Data Response:</h4>
                <pre class="bg-white p-3 rounded text-sm overflow-x-auto max-h-64 overflow-y-auto">{{ lastSelectedStockData | json }}</pre>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class StockSearchDemoComponent {
  lastSelectedStock: StockSearchResult | null = null;
  lastSelectedStockData: StockQuote | null = null;

  onStockSelected(stock: StockSearchResult): void {
    console.log('Stock selected:', stock);
    this.lastSelectedStock = stock;
  }

  onStockDataSelected(stockData: StockQuote): void {
    console.log('Stock data received:', stockData);
    this.lastSelectedStockData = stockData;
  }
}