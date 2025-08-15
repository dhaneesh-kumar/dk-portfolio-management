import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stock, BatchPriceUpdateDto } from '../../models/portfolio.model';
import { PortfolioCalculationService } from '../../services/portfolio-calculation.service';

@Component({
  selector: 'app-batch-price-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Batch Price Update</h3>
        <button
          (click)="closeModal()"
          class="text-gray-400 hover:text-gray-600"
          type="button"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Update Date
        </label>
        <input
          type="date"
          [(ngModel)]="updateDate"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          [(ngModel)]="notes"
          rows="2"
          placeholder="Add notes about this price update..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left p-3 font-medium text-gray-700 border-b">Stock</th>
              <th class="text-left p-3 font-medium text-gray-700 border-b">Current Price</th>
              <th class="text-left p-3 font-medium text-gray-700 border-b">New Price</th>
              <th class="text-left p-3 font-medium text-gray-700 border-b">Quantity</th>
              <th class="text-left p-3 font-medium text-gray-700 border-b">Change</th>
              <th class="text-left p-3 font-medium text-gray-700 border-b">Value Impact</th>
            </tr>
          </thead>
          <tbody>
            @for (update of stockUpdates(); track update.stockId) {
              <tr class="border-b hover:bg-gray-50">
                <td class="p-3">
                  <div>
                    <div class="font-medium text-gray-900">{{ getStockName(update.stockId) }}</div>
                    <div class="text-sm text-gray-500">{{ getStockTicker(update.stockId) }}</div>
                  </div>
                </td>
                <td class="p-3 text-gray-600">
                  ₹{{ getStockCurrentPrice(update.stockId) | number:'1.2-2' }}
                </td>
                <td class="p-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="update.price"
                    (ngModelChange)="onPriceChange(update.stockId, $event)"
                    class="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td class="p-3">
                  <input
                    type="number"
                    min="0"
                    [(ngModel)]="update.quantity"
                    (ngModelChange)="onQuantityChange(update.stockId, $event)"
                    class="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td class="p-3">
                  <span 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    [class]="getPriceChangeClass(update.stockId)"
                  >
                    {{ getPriceChangeText(update.stockId) }}
                  </span>
                </td>
                <td class="p-3">
                  <span 
                    class="font-medium"
                    [class]="getValueImpactClass(update.stockId)"
                  >
                    {{ getValueImpactText(update.stockId) }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-6 bg-gray-50 p-4 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-600">Total Portfolio Impact</div>
            <div 
              class="text-lg font-semibold"
              [class]="getTotalImpactClass()"
            >
              {{ getTotalImpactText() }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">Updated Stocks</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ getUpdatedStocksCount() }} of {{ stocks().length }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          (click)="closeModal()"
          type="button"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          (click)="clearAll()"
          type="button"
          class="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Clear All
        </button>
        <button
          (click)="applyUpdates()"
          [disabled]="!hasValidUpdates()"
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Update Prices
        </button>
      </div>
    </div>
  `
})
export class BatchPriceUpdateComponent {
  @Input() portfolioId!: string;
  @Input() stocks = signal<Stock[]>([]);
  @Output() priceUpdated = new EventEmitter<BatchPriceUpdateDto>();
  @Output() closed = new EventEmitter<void>();

  updateDate = new Date().toISOString().split('T')[0];
  notes = '';

  stockUpdates = computed(() => {
    return this.stocks().map(stock => ({
      stockId: stock.id!,
      price: stock.currentPrice,
      quantity: stock.quantity || stock.shares,
      originalPrice: stock.currentPrice,
      originalQuantity: stock.quantity || stock.shares
    }));
  });

  constructor(private calculationService: PortfolioCalculationService) {}

  onPriceChange(stockId: string, newPrice: number): void {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (update) {
      update.price = newPrice;
    }
  }

  onQuantityChange(stockId: string, newQuantity: number): void {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (update) {
      update.quantity = newQuantity;
    }
  }

  getStockName(stockId: string): string {
    return this.stocks().find(s => s.id === stockId)?.name || '';
  }

  getStockTicker(stockId: string): string {
    return this.stocks().find(s => s.id === stockId)?.ticker || '';
  }

  getStockCurrentPrice(stockId: string): number {
    return this.stocks().find(s => s.id === stockId)?.currentPrice || 0;
  }

  getPriceChangeText(stockId: string): string {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (!update) return '';
    
    const change = update.price - update.originalPrice;
    const changePercent = update.originalPrice > 0 ? (change / update.originalPrice) * 100 : 0;
    
    if (Math.abs(change) < 0.01) return 'No Change';
    
    const sign = change > 0 ? '+' : '';
    return `${sign}₹${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }

  getPriceChangeClass(stockId: string): string {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (!update) return '';
    
    const change = update.price - update.originalPrice;
    
    if (Math.abs(change) < 0.01) return 'bg-gray-100 text-gray-800';
    return change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getValueImpactText(stockId: string): string {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (!update) return '';
    
    const oldValue = update.originalPrice * update.originalQuantity;
    const newValue = update.price * update.quantity;
    const impact = newValue - oldValue;
    
    if (Math.abs(impact) < 0.01) return 'No Impact';
    
    const sign = impact > 0 ? '+' : '';
    return `${sign}₹${impact.toFixed(2)}`;
  }

  getValueImpactClass(stockId: string): string {
    const update = this.stockUpdates().find(u => u.stockId === stockId);
    if (!update) return '';
    
    const oldValue = update.originalPrice * update.originalQuantity;
    const newValue = update.price * update.quantity;
    const impact = newValue - oldValue;
    
    if (Math.abs(impact) < 0.01) return 'text-gray-600';
    return impact > 0 ? 'text-green-600' : 'text-red-600';
  }

  getTotalImpactText(): string {
    const totalImpact = this.stockUpdates().reduce((sum, update) => {
      const oldValue = update.originalPrice * update.originalQuantity;
      const newValue = update.price * update.quantity;
      return sum + (newValue - oldValue);
    }, 0);
    
    if (Math.abs(totalImpact) < 0.01) return 'No Change';
    
    const sign = totalImpact > 0 ? '+' : '';
    return `${sign}₹${totalImpact.toFixed(2)}`;
  }

  getTotalImpactClass(): string {
    const totalImpact = this.stockUpdates().reduce((sum, update) => {
      const oldValue = update.originalPrice * update.originalQuantity;
      const newValue = update.price * update.quantity;
      return sum + (newValue - oldValue);
    }, 0);
    
    if (Math.abs(totalImpact) < 0.01) return 'text-gray-600';
    return totalImpact > 0 ? 'text-green-600' : 'text-red-600';
  }

  getUpdatedStocksCount(): number {
    return this.stockUpdates().filter(update => {
      const priceChanged = Math.abs(update.price - update.originalPrice) >= 0.01;
      const quantityChanged = update.quantity !== update.originalQuantity;
      return priceChanged || quantityChanged;
    }).length;
  }

  hasValidUpdates(): boolean {
    return this.getUpdatedStocksCount() > 0;
  }

  clearAll(): void {
    this.stockUpdates().forEach(update => {
      update.price = update.originalPrice;
      update.quantity = update.originalQuantity;
    });
  }

  applyUpdates(): void {
    const updates = this.stockUpdates()
      .filter(update => {
        const priceChanged = Math.abs(update.price - update.originalPrice) >= 0.01;
        const quantityChanged = update.quantity !== update.originalQuantity;
        return priceChanged || quantityChanged;
      })
      .map(update => ({
        stockId: update.stockId,
        price: update.price,
        quantity: update.quantity
      }));

    if (updates.length === 0) return;

    const batchUpdate: BatchPriceUpdateDto = {
      portfolioId: this.portfolioId,
      stockUpdates: updates,
      notes: this.notes.trim() || undefined
    };

    this.priceUpdated.emit(batchUpdate);
  }

  closeModal(): void {
    this.closed.emit();
  }
}
