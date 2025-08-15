import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stock, Dividend, AddDividendDto, DividendFrequency } from '../../models/portfolio.model';

@Component({
  selector: 'app-dividend-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-medium text-gray-900">Dividend Tracker</h4>
          <button
            (click)="toggleAddForm()"
            class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {{ showAddForm() ? 'Cancel' : 'Add Dividend' }}
          </button>
        </div>

        @if (dividendSummary()) {
          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-sm text-green-600">Total Dividends</div>
              <div class="text-xl font-bold text-green-700">
                ₹{{ dividendSummary()!.totalAmount | number:'1.2-2' }}
              </div>
            </div>
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-sm text-blue-600">This Year</div>
              <div class="text-xl font-bold text-blue-700">
                ₹{{ dividendSummary()!.yearToDate | number:'1.2-2' }}
              </div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-sm text-purple-600">Avg Yield</div>
              <div class="text-xl font-bold text-purple-700">
                {{ dividendSummary()!.averageYield | number:'1.2-2' }}%
              </div>
            </div>
          </div>
        }
      </div>

      @if (showAddForm()) {
        <div class="p-4 bg-gray-50 border-b border-gray-200">
          <form (ngSubmit)="addDividend()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <select
                  [(ngModel)]="newDividend.stockId"
                  name="stockId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Stock</option>
                  @for (stock of availableStocks(); track stock.id) {
                    <option [value]="stock.id">{{ stock.name }} ({{ stock.ticker }})</option>
                  }
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="newDividend.amount"
                  name="amount"
                  required
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Ex-Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="newDividend.exDate"
                  name="exDate"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Pay Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="newDividend.payDate"
                  name="payDate"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  [(ngModel)]="newDividend.frequency"
                  name="frequency"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="semi_annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="special">Special</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                [(ngModel)]="newDividend.notes"
                name="notes"
                rows="2"
                placeholder="Additional notes about this dividend..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="resetForm()"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
              <button
                type="submit"
                [disabled]="!isFormValid()"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Dividend
              </button>
            </div>
          </form>
        </div>
      }

      <div class="overflow-x-auto">
        @if (sortedDividends().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Stock</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Amount</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Ex-Date</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Pay Date</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Frequency</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Yield</th>
                <th class="text-left p-3 text-sm font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (dividend of sortedDividends(); track dividend.id) {
                <tr class="hover:bg-gray-50">
                  <td class="p-3">
                    <div>
                      <div class="font-medium text-gray-900">{{ getStockName(dividend.stockId) }}</div>
                      <div class="text-sm text-gray-500">{{ getStockTicker(dividend.stockId) }}</div>
                    </div>
                  </td>
                  <td class="p-3 text-sm font-medium text-green-600">
                    ₹{{ dividend.amount | number:'1.2-2' }}
                  </td>
                  <td class="p-3 text-sm text-gray-600">
                    {{ formatDate(dividend.exDate) }}
                  </td>
                  <td class="p-3 text-sm text-gray-600">
                    {{ formatDate(dividend.payDate) }}
                  </td>
                  <td class="p-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ formatFrequency(dividend.frequency) }}
                    </span>
                  </td>
                  <td class="p-3 text-sm text-gray-900">
                    {{ calculateDividendYield(dividend) | number:'1.2-2' }}%
                  </td>
                  <td class="p-3 text-sm text-gray-600">
                    <div class="max-w-xs truncate" [title]="dividend.notes || ''">
                      {{ dividend.notes || '-' }}
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Dividends Recorded</h3>
            <p class="text-gray-500">
              Start tracking dividends by clicking "Add Dividend" above.
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class DividendTrackerComponent {
  @Input() portfolioId!: string;
  @Input() stocks = signal<Stock[]>([]);
  @Output() dividendAdded = new EventEmitter<AddDividendDto>();

  showAddForm = signal(false);
  
  newDividend = {
    stockId: '',
    amount: 0,
    exDate: '',
    payDate: '',
    frequency: 'quarterly' as DividendFrequency,
    notes: ''
  };

  availableStocks = computed(() => {
    return this.stocks().filter(stock => !stock.isCashStock);
  });

  allDividends = computed(() => {
    const dividends: (Dividend & { stockId: string })[] = [];
    
    this.stocks().forEach(stock => {
      if (stock.dividends) {
        stock.dividends.forEach(dividend => {
          dividends.push({
            ...dividend,
            stockId: stock.id!
          });
        });
      }
    });
    
    return dividends;
  });

  sortedDividends = computed(() => {
    return [...this.allDividends()].sort((a, b) => 
      new Date(b.exDate).getTime() - new Date(a.exDate).getTime()
    );
  });

  dividendSummary = computed(() => {
    const dividends = this.allDividends();
    if (dividends.length === 0) return null;

    const totalAmount = dividends.reduce((sum, div) => sum + div.amount, 0);
    
    const currentYear = new Date().getFullYear();
    const yearToDate = dividends
      .filter(div => new Date(div.exDate).getFullYear() === currentYear)
      .reduce((sum, div) => sum + div.amount, 0);

    // Calculate average yield across all dividend-paying stocks
    const dividendStocks = this.stocks().filter(stock => 
      stock.dividends && stock.dividends.length > 0 && !stock.isCashStock
    );
    
    let totalYield = 0;
    dividendStocks.forEach(stock => {
      const stockDividends = stock.dividends || [];
      const annualDividend = stockDividends
        .filter(div => new Date(div.exDate).getFullYear() === currentYear)
        .reduce((sum, div) => sum + div.amount, 0);
      
      const stockValue = stock.quantity * stock.currentPrice;
      if (stockValue > 0) {
        totalYield += (annualDividend / stockValue) * 100;
      }
    });
    
    const averageYield = dividendStocks.length > 0 ? totalYield / dividendStocks.length : 0;

    return {
      totalAmount,
      yearToDate,
      averageYield
    };
  });

  toggleAddForm(): void {
    this.showAddForm.update(show => !show);
    if (!this.showAddForm()) {
      this.resetForm();
    }
  }

  isFormValid(): boolean {
    return !!(
      this.newDividend.stockId &&
      this.newDividend.amount > 0 &&
      this.newDividend.exDate &&
      this.newDividend.payDate
    );
  }

  addDividend(): void {
    if (!this.isFormValid()) return;

    const dividendDto: AddDividendDto = {
      portfolioId: this.portfolioId,
      stockId: this.newDividend.stockId,
      amount: this.newDividend.amount,
      exDate: new Date(this.newDividend.exDate),
      payDate: new Date(this.newDividend.payDate),
      frequency: this.newDividend.frequency,
      notes: this.newDividend.notes.trim() || undefined
    };

    this.dividendAdded.emit(dividendDto);
    this.resetForm();
    this.showAddForm.set(false);
  }

  resetForm(): void {
    this.newDividend = {
      stockId: '',
      amount: 0,
      exDate: '',
      payDate: '',
      frequency: 'quarterly',
      notes: ''
    };
  }

  getStockName(stockId: string): string {
    return this.stocks().find(s => s.id === stockId)?.name || 'Unknown';
  }

  getStockTicker(stockId: string): string {
    return this.stocks().find(s => s.id === stockId)?.ticker || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatFrequency(frequency: DividendFrequency): string {
    const labels: Record<DividendFrequency, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      semi_annual: 'Semi-Annual',
      annual: 'Annual',
      special: 'Special'
    };
    return labels[frequency];
  }

  calculateDividendYield(dividend: Dividend & { stockId: string }): number {
    const stock = this.stocks().find(s => s.id === dividend.stockId);
    if (!stock) return 0;

    const stockValue = stock.quantity * stock.currentPrice;
    if (stockValue === 0) return 0;

    // For display purposes, show annual yield
    const multiplier = this.getAnnualMultiplier(dividend.frequency);
    const annualDividend = dividend.amount * multiplier;
    
    return (annualDividend / stockValue) * 100;
  }

  private getAnnualMultiplier(frequency: DividendFrequency): number {
    const multipliers: Record<DividendFrequency, number> = {
      monthly: 12,
      quarterly: 4,
      semi_annual: 2,
      annual: 1,
      special: 1
    };
    return multipliers[frequency];
  }
}
