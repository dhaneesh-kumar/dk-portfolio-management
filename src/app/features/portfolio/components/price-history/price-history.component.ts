import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Stock, PriceHistory } from '../../models/portfolio.model';
import { PortfolioCalculationService } from '../../services/portfolio-calculation.service';

@Component({
  selector: 'app-price-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-medium text-gray-900">Price History</h4>
          <button
            (click)="toggleExpanded()"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {{ isExpanded() ? 'Show Less' : 'View All' }}
          </button>
        </div>
        
        @if (analysis()) {
          <div class="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-sm text-gray-500">Average Price</div>
              <div class="text-lg font-semibold text-gray-900">
                ₹{{ analysis()!.averagePrice | number:'1.2-2' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500">Price Range</div>
              <div class="text-lg font-semibold text-gray-900">
                ₹{{ analysis()!.priceRange.min | number:'1.2-2' }} - ₹{{ analysis()!.priceRange.max | number:'1.2-2' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500">Total Change</div>
              <div 
                class="text-lg font-semibold"
                [class]="analysis()!.priceChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ analysis()!.priceChange >= 0 ? '+' : '' }}₹{{ analysis()!.priceChange | number:'1.2-2' }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500">% Change</div>
              <div 
                class="text-lg font-semibold"
                [class]="analysis()!.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ analysis()!.priceChangePercent >= 0 ? '+' : '' }}{{ analysis()!.priceChangePercent | number:'1.2-2' }}%
              </div>
            </div>
          </div>
        }
      </div>

      <div class="overflow-x-auto">
        @if (displayedHistory().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Date</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Price</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Quantity</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Value</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Change</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (entry of displayedHistory(); track entry.id; let i = $index) {
                <tr class="hover:bg-gray-50">
                  <td class="p-3 text-sm text-gray-900">
                    {{ formatDate(entry.date) }}
                  </td>
                  <td class="p-3 text-sm font-medium text-gray-900">
                    ₹{{ entry.price | number:'1.2-2' }}
                  </td>
                  <td class="p-3 text-sm text-gray-600">
                    {{ entry.quantity | number:'1.0-0' }}
                  </td>
                  <td class="p-3 text-sm text-gray-900">
                    ₹{{ (entry.price * entry.quantity) | number:'1.2-2' }}
                  </td>
                  <td class="p-3 text-sm">
                    @if (i < displayedHistory().length - 1) {
                      <span 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        [class]="getPriceChangeClass(entry, displayedHistory()[i + 1])"
                      >
                        {{ getPriceChangeText(entry, displayedHistory()[i + 1]) }}
                      </span>
                    } @else {
                      <span class="text-gray-400 text-xs">-</span>
                    }
                  </td>
                  <td class="p-3 text-sm text-gray-600">
                    <div class="max-w-xs truncate" [title]="entry.notes || ''">
                      {{ entry.notes || '-' }}
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="p-8 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
              </path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Price History</h3>
            <p class="text-gray-500">
              Price history will appear here when you update stock prices.
            </p>
          </div>
        }
      </div>

      @if (!isExpanded() && sortedHistory().length > 5) {
        <div class="p-4 text-center border-t border-gray-200">
          <button
            (click)="toggleExpanded()"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View {{ sortedHistory().length - 5 }} more entries
          </button>
        </div>
      }
    </div>
  `
})
export class PriceHistoryComponent {
  @Input() stock = signal<Stock | null>(null);
  
  isExpanded = signal(false);
  
  sortedHistory = computed(() => {
    const stock = this.stock();
    if (!stock?.priceHistory) return [];
    
    return [...stock.priceHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
  
  displayedHistory = computed(() => {
    const history = this.sortedHistory();
    return this.isExpanded() ? history : history.slice(0, 5);
  });
  
  analysis = computed(() => {
    const stock = this.stock();
    if (!stock) return null;
    
    return this.calculationService.getPriceHistoryAnalysis(stock);
  });
  
  constructor(private calculationService: PortfolioCalculationService) {}
  
  toggleExpanded(): void {
    this.isExpanded.update(expanded => !expanded);
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getPriceChangeText(current: PriceHistory, previous: PriceHistory): string {
    const change = current.price - previous.price;
    const changePercent = previous.price > 0 ? (change / previous.price) * 100 : 0;
    
    if (Math.abs(change) < 0.01) return 'No Change';
    
    const sign = change > 0 ? '+' : '';
    return `${sign}₹${change.toFixed(2)} (${sign}${changePercent.toFixed(1)}%)`;
  }
  
  getPriceChangeClass(current: PriceHistory, previous: PriceHistory): string {
    const change = current.price - previous.price;
    
    if (Math.abs(change) < 0.01) return 'bg-gray-100 text-gray-800';
    return change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}
