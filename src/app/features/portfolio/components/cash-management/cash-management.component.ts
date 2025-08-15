import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Portfolio, UpdatePortfolioBudgetDto } from '../../models/portfolio.model';
import { PortfolioCalculationService } from '../../services/portfolio-calculation.service';

@Component({
  selector: 'app-cash-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-medium text-gray-900">Cash Management</h4>
          <button
            (click)="toggleAddCashForm()"
            class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {{ showAddCashForm() ? 'Cancel' : 'Add Cash' }}
          </button>
        </div>
      </div>

      <!-- Cash Overview -->
      <div class="p-4 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-600">Total Budget</div>
            <div class="text-xl font-bold text-blue-700">
              ₹{{ portfolio()?.budget | number:'1.2-2' }}
            </div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-sm text-green-600">Available Cash</div>
            <div class="text-xl font-bold text-green-700">
              ₹{{ cashPosition().availableCash | number:'1.2-2' }}
            </div>
          </div>
          <div class="text-center p-3 bg-yellow-50 rounded-lg">
            <div class="text-sm text-yellow-600">Invested Amount</div>
            <div class="text-xl font-bold text-yellow-700">
              ₹{{ cashPosition().totalInvested | number:'1.2-2' }}
            </div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-sm text-purple-600">Cash Allocation</div>
            <div class="text-xl font-bold text-purple-700">
              {{ cashPosition().cashAllocationPercent | number:'1.1-1' }}%
            </div>
          </div>
        </div>
      </div>

      @if (showAddCashForm()) {
        <div class="p-4 border-b border-gray-200">
          <form (ngSubmit)="addCash()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Add (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  [(ngModel)]="newCashAmount"
                  name="amount"
                  required
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  [(ngModel)]="transactionType"
                  name="type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="deposit">Deposit</option>
                  <option value="dividend">Dividend Income</option>
                  <option value="profit">Profit Booking</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                [(ngModel)]="cashNotes"
                name="notes"
                rows="2"
                placeholder="Add notes about this cash transaction..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="resetCashForm()"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
              <button
                type="submit"
                [disabled]="!isCashFormValid()"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Cash
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Cash Stock Details -->
      @if (cashStock()) {
        <div class="p-4">
          <h5 class="text-md font-medium text-gray-900 mb-3">Cash Position Details</h5>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500">Cash Stock Value</div>
                <div class="text-lg font-semibold text-gray-900">
                  ₹{{ cashStock()!.totalValue | number:'1.2-2' }}
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Cash Units</div>
                <div class="text-lg font-semibold text-gray-900">
                  {{ cashStock()!.quantity | number:'1.0-0' }}
                </div>
              </div>
            </div>
            
            @if (cashStock()!.priceHistory && cashStock()!.priceHistory!.length > 0) {
              <div class="mt-4">
                <div class="text-sm font-medium text-gray-700 mb-2">Recent Cash Transactions</div>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  @for (entry of getRecentCashHistory(); track entry.id) {
                    <div class="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ formatTransactionType(entry.notes) }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ formatDate(entry.date) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-green-600">
                          +₹{{ entry.quantity | number:'1.2-2' }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="p-4">
          <div class="text-center text-gray-500">
            <div class="text-lg font-medium text-gray-900 mb-2">No Cash Position</div>
            <p class="text-gray-500 mb-4">
              Add cash to track your available funds for investment.
            </p>
            <button
              (click)="createCashStock()"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Initialize Cash Tracking
            </button>
          </div>
        </div>
      }

      <!-- Investment Allocation Guide -->
      <div class="p-4 bg-blue-50 border-t border-gray-200">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm font-medium text-blue-900">Investment Guide</div>
            <div class="text-sm text-blue-700 mt-1">
              <div class="space-y-1">
                <div>• Maximum per stock: {{ portfolio()?.maxStockAllocationPercent }}%</div>
                <div>• Maximum stocks: {{ portfolio()?.maxStocks }}</div>
                <div>• Available for investment: ₹{{ cashPosition().availableCash | number:'1.2-2' }}</div>
                @if (maxInvestmentPerStock() > 0) {
                  <div>• Max per stock: ₹{{ maxInvestmentPerStock() | number:'1.2-2' }}</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CashManagementComponent {
  @Input() portfolio = signal<Portfolio | null>(null);
  @Output() budgetUpdated = new EventEmitter<UpdatePortfolioBudgetDto>();
  @Output() cashStockCreated = new EventEmitter<void>();

  showAddCashForm = signal(false);
  newCashAmount = 0;
  transactionType = 'deposit';
  cashNotes = '';

  cashStock = computed(() => {
    const portfolio = this.portfolio();
    if (!portfolio) return null;
    
    return portfolio.stocks.find(stock => stock.isCashStock) || null;
  });

  cashPosition = computed(() => {
    const portfolio = this.portfolio();
    if (!portfolio) {
      return { totalInvested: 0, availableCash: 0, cashAllocationPercent: 0 };
    }
    
    return this.calculationService.calculateCashPosition(portfolio);
  });

  maxInvestmentPerStock = computed(() => {
    const portfolio = this.portfolio();
    if (!portfolio) return 0;
    
    return (portfolio.budget * portfolio.maxStockAllocationPercent) / 100;
  });

  constructor(private calculationService: PortfolioCalculationService) {}

  toggleAddCashForm(): void {
    this.showAddCashForm.update(show => !show);
    if (!this.showAddCashForm()) {
      this.resetCashForm();
    }
  }

  isCashFormValid(): boolean {
    return this.newCashAmount > 0;
  }

  addCash(): void {
    if (!this.isCashFormValid()) return;

    const portfolio = this.portfolio();
    if (!portfolio) return;

    const notes = this.formatTransactionNotes(this.transactionType, this.cashNotes);
    
    const budgetUpdate: UpdatePortfolioBudgetDto = {
      portfolioId: portfolio.id!,
      additionalAmount: this.newCashAmount,
      notes
    };

    this.budgetUpdated.emit(budgetUpdate);
    this.resetCashForm();
    this.showAddCashForm.set(false);
  }

  resetCashForm(): void {
    this.newCashAmount = 0;
    this.transactionType = 'deposit';
    this.cashNotes = '';
  }

  createCashStock(): void {
    this.cashStockCreated.emit();
  }

  getRecentCashHistory(): any[] {
    const cash = this.cashStock();
    if (!cash?.priceHistory) return [];
    
    return [...cash.priceHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTransactionType(notes?: string): string {
    if (!notes) return 'Cash Transaction';
    
    if (notes.includes('deposit')) return 'Cash Deposit';
    if (notes.includes('dividend')) return 'Dividend Income';
    if (notes.includes('profit')) return 'Profit Booking';
    
    return 'Cash Addition';
  }

  private formatTransactionNotes(type: string, notes: string): string {
    const typeLabels: Record<string, string> = {
      deposit: 'Cash Deposit',
      dividend: 'Dividend Income',
      profit: 'Profit Booking',
      other: 'Other'
    };
    
    const label = typeLabels[type] || 'Cash Transaction';
    return notes.trim() ? `${label}: ${notes}` : label;
  }
}
