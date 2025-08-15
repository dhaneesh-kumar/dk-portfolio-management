import { Component, Input, Output, EventEmitter, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Portfolio, UpdatePortfolioDto, PortfolioType, RiskLevel, RebalanceFrequency } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Edit Portfolio</h3>
          <button
            (click)="closeForm()"
            class="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form (ngSubmit)="savePortfolio()" class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              name="name"
              required
              placeholder="Enter portfolio name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Type <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="formData.type"
              name="type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="equity">Equity</option>
              <option value="debt">Debt</option>
              <option value="hybrid">Hybrid</option>
              <option value="index">Index</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            [(ngModel)]="formData.description"
            name="description"
            rows="3"
            placeholder="Describe your portfolio strategy and goals"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Budget and Constraints -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Budget & Constraints</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Total Budget (₹) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                [(ngModel)]="formData.budget"
                name="budget"
                required
                placeholder="0.00"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Stocks <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                [(ngModel)]="formData.maxStocks"
                name="maxStocks"
                required
                placeholder="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Stock Allocation (%) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                [(ngModel)]="formData.maxStockAllocationPercent"
                name="maxStockAllocationPercent"
                required
                placeholder="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Constraint Validation Messages -->
          @if (constraintErrors().length > 0) {
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div class="text-sm font-medium text-red-800 mb-1">Constraint Issues:</div>
              <ul class="text-sm text-red-700 space-y-1">
                @for (error of constraintErrors(); track error) {
                  <li>• {{ error }}</li>
                }
              </ul>
            </div>
          }

          <!-- Helpful Tips -->
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div class="text-sm text-blue-800">
              <div class="font-medium mb-1">💡 Tips:</div>
              <ul class="space-y-1">
                <li>• Maximum stocks of {{ formData.maxStocks }} with {{ formData.maxStockAllocationPercent }}% max allocation means you could theoretically hold {{ getMaxEvenWeightedStocks() }} evenly weighted stocks</li>
                <li>• A {{ formData.maxStockAllocationPercent }}% max allocation per stock helps maintain diversification</li>
                <li>• Consider leaving some cash (5-10%) for opportunities and emergencies</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Additional Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Risk Level
            </label>
            <select
              [(ngModel)]="formData.riskLevel"
              name="riskLevel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Risk Level</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
              <option value="very_aggressive">Very Aggressive</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Target Return (% p.a.)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              [(ngModel)]="formData.targetReturn"
              name="targetReturn"
              placeholder="12.0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rebalance Frequency
            </label>
            <select
              [(ngModel)]="formData.rebalanceFrequency"
              name="rebalanceFrequency"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Frequency</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi_annual">Semi-Annual</option>
              <option value="annual">Annual</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              [(ngModel)]="formData.category"
              name="category"
              placeholder="e.g., Growth, Value, Index"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            [(ngModel)]="tagsInput"
            name="tags"
            placeholder="e.g., large-cap, technology, dividend"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          @if (parsedTags().length > 0) {
            <div class="mt-2 flex flex-wrap gap-2">
              @for (tag of parsedTags(); track tag) {
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ tag }}
                </span>
              }
            </div>
          }
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="resetForm()"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="button"
            (click)="closeForm()"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="!isFormValid()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Portfolio
          </button>
        </div>
      </form>
    </div>
  `
})
export class PortfolioEditFormComponent implements OnInit {
  @Input() portfolio = signal<Portfolio | null>(null);
  @Output() portfolioUpdated = new EventEmitter<UpdatePortfolioDto>();
  @Output() formClosed = new EventEmitter<void>();

  formData = {
    name: '',
    description: '',
    type: 'equity' as PortfolioType,
    budget: 0,
    maxStocks: 10,
    maxStockAllocationPercent: 20,
    riskLevel: undefined as RiskLevel | undefined,
    targetReturn: undefined as number | undefined,
    rebalanceFrequency: undefined as RebalanceFrequency | undefined,
    category: '',
  };

  tagsInput = '';

  parsedTags = computed(() => {
    return this.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  });

  constraintErrors = computed(() => {
    const errors: string[] = [];
    
    if (this.formData.maxStockAllocationPercent <= 0 || this.formData.maxStockAllocationPercent > 100) {
      errors.push('Max stock allocation must be between 1% and 100%');
    }
    
    if (this.formData.maxStocks <= 0) {
      errors.push('Maximum stocks must be at least 1');
    }
    
    const minStocksBasedOnAllocation = Math.ceil(100 / this.formData.maxStockAllocationPercent);
    if (this.formData.maxStocks < minStocksBasedOnAllocation) {
      errors.push(`With ${this.formData.maxStockAllocationPercent}% max allocation, you need at least ${minStocksBasedOnAllocation} max stocks to achieve 100% allocation`);
    }
    
    if (this.formData.budget <= 0) {
      errors.push('Budget must be greater than 0');
    }
    
    return errors;
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const portfolio = this.portfolio();
    if (portfolio) {
      this.formData = {
        name: portfolio.name,
        description: portfolio.description,
        type: portfolio.type,
        budget: portfolio.budget,
        maxStocks: portfolio.maxStocks,
        maxStockAllocationPercent: portfolio.maxStockAllocationPercent,
        riskLevel: portfolio.riskLevel,
        targetReturn: portfolio.targetReturn,
        rebalanceFrequency: portfolio.rebalanceFrequency,
        category: portfolio.category || '',
      };
      
      this.tagsInput = portfolio.tags?.join(', ') || '';
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.name.trim() &&
      this.formData.type &&
      this.formData.budget > 0 &&
      this.formData.maxStocks > 0 &&
      this.formData.maxStockAllocationPercent > 0 &&
      this.formData.maxStockAllocationPercent <= 100 &&
      this.constraintErrors().length === 0
    );
  }

  savePortfolio(): void {
    if (!this.isFormValid()) return;

    const portfolio = this.portfolio();
    if (!portfolio) return;

    const updateDto: UpdatePortfolioDto = {
      id: portfolio.id!,
      name: this.formData.name.trim(),
      description: this.formData.description.trim(),
      type: this.formData.type,
      category: this.formData.category.trim() || undefined,
      tags: this.parsedTags().length > 0 ? this.parsedTags() : undefined,
      riskLevel: this.formData.riskLevel,
      targetReturn: this.formData.targetReturn,
      rebalanceFrequency: this.formData.rebalanceFrequency,
      // Note: budget, maxStocks, maxStockAllocationPercent would need to be added to UpdatePortfolioDto
    };

    this.portfolioUpdated.emit(updateDto);
  }

  resetForm(): void {
    this.initializeForm();
  }

  getMaxEvenWeightedStocks(): number {
    return Math.floor(100 / Math.max(1, this.formData.maxStockAllocationPercent));
  }

  closeForm(): void {
    this.formClosed.emit();
  }
}
