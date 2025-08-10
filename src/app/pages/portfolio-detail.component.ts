import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../services/portfolio.service';
import { Portfolio, Stock } from '../models/portfolio.model';
import { PortfolioChartComponent } from '../components/portfolio-chart.component';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PortfolioChartComponent],
  template: `
    @if (portfolio()) {
      <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <a routerLink="/" class="text-slate-400 hover:text-slate-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </a>
                <div>
                  <h1 class="text-3xl font-bold text-slate-900">{{portfolio()!.name}}</h1>
                  <p class="text-slate-600 mt-1">{{portfolio()!.description}}</p>
                </div>
              </div>
              <div class="flex gap-3">
                <button 
                  (click)="rebalancePortfolio()"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rebalance
                </button>
                <button 
                  (click)="showAddStockModal.set(true)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Portfolio Stats -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Value</p>
                  <p class="text-2xl font-bold text-slate-900">₹{{portfolio()!.totalValue | number:'1.0-0'}}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Return</p>
                  <p class="text-2xl font-bold text-green-600">+{{portfolio()!.totalReturnPercent}}%</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Holdings</p>
                  <p class="text-2xl font-bold text-slate-900">{{portfolio()!.stocks.length}}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Weight Check</p>
                  <p class="text-2xl font-bold" [class]="getTotalWeight() === 100 ? 'text-green-600' : 'text-red-600'">
                    {{getTotalWeight()}}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Portfolio Charts -->
          @if (portfolio()!.stocks.length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <app-portfolio-chart
                [stocks]="portfolio()!.stocks"
                title="Portfolio Allocation (Pie Chart)"
                type="pie">
              </app-portfolio-chart>

              <app-portfolio-chart
                [stocks]="portfolio()!.stocks"
                title="Holdings Distribution (Bar Chart)"
                type="bar">
              </app-portfolio-chart>
            </div>
          }

          <!-- Stock Holdings Table -->
          <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200">
              <h2 class="text-xl font-bold text-slate-900">Stock Holdings</h2>
            </div>
            
            @if (portfolio()!.stocks.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shares</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Weight</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Change</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-200">
                    @for (stock of portfolio()!.stocks; track stock.id) {
                      <tr class="hover:bg-slate-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-slate-900">{{stock.ticker}}</div>
                            <div class="text-sm text-slate-500">{{stock.name}}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-slate-900">₹{{stock.currentPrice | number:'1.2-2'}}</div>
                          @if (stock.marketData) {
                            <div class="text-sm" [class]="stock.marketData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'">
                              {{stock.marketData.changePercent >= 0 ? '+' : ''}}{{stock.marketData.changePercent}}%
                            </div>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{{stock.shares}}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="number" 
                            [value]="stock.weight"
                            (change)="updateWeight(stock.id, $event)"
                            min="0" 
                            max="100" 
                            step="0.1"
                            class="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <span class="text-sm text-slate-500 ml-1">%</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          ₹{{stock.totalValue | number:'1.0-0'}}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          @if (stock.marketData) {
                            <span class="text-sm" [class]="stock.marketData.change >= 0 ? 'text-green-600' : 'text-red-600'">
                              {{stock.marketData.change >= 0 ? '+' : ''}}₹{{stock.marketData.change | number:'1.2-2'}}
                            </span>
                          }
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div class="flex gap-2">
                            <a 
                              [routerLink]="['/stock', stock.id]"
                              [queryParams]="{portfolio: portfolio()!.id}"
                              class="text-blue-600 hover:text-blue-900">View</a>
                            <button 
                              (click)="removeStock(stock.id)"
                              class="text-red-600 hover:text-red-900">Remove</button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
                </svg>
                <h3 class="text-lg font-medium text-slate-900 mb-2">No stocks added yet</h3>
                <p class="text-slate-600 mb-4">Start building your portfolio by adding your first stock</p>
                <button 
                  (click)="showAddStockModal.set(true)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Add Your First Stock
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Add Stock Modal -->
        @if (showAddStockModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl max-w-md w-full p-6">
              <h2 class="text-2xl font-bold text-slate-900 mb-4">Add Stock</h2>
              
              <form (ngSubmit)="addStock()" #form="ngForm">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Stock Ticker</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newStock.ticker"
                    name="ticker"
                    required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., RELIANCE">
                </div>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newStock.name"
                    name="name"
                    required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Reliance Industries Ltd">
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Shares</label>
                    <input 
                      type="number" 
                      [(ngModel)]="newStock.shares"
                      name="shares"
                      required
                      min="1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      [(ngModel)]="newStock.currentPrice"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2450.50">
                  </div>
                </div>
                
                <div class="mb-6">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Weight (%)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newStock.weight"
                    name="weight"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10.5">
                </div>
                
                <div class="flex gap-3">
                  <button 
                    type="button"
                    (click)="showAddStockModal.set(false); resetNewStock()"
                    class="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    [disabled]="!form.valid"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Add Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-slate-900 mb-4">Portfolio Not Found</h1>
          <a routerLink="/" class="text-blue-600 hover:text-blue-800">← Back to Portfolios</a>
        </div>
      </div>
    }
  `
})
export class PortfolioDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolioService = inject(PortfolioService);
  
  portfolioId = signal<string>('');
  portfolio = computed(() => {
    const id = this.portfolioId();
    return id ? this.portfolioService.getPortfolio(id) : null;
  });
  
  showAddStockModal = signal(false);
  newStock = {
    ticker: '',
    name: '',
    weight: 0,
    shares: 0,
    currentPrice: 0
  };

  constructor() {
    this.route.params.subscribe(params => {
      this.portfolioId.set(params['id']);
    });
  }

  getTotalWeight(): number {
    const p = this.portfolio();
    if (!p) return 0;
    return p.stocks.reduce((sum, stock) => sum + stock.weight, 0);
  }

  updateWeight(stockId: string, event: any): void {
    const weight = parseFloat(event.target.value);
    if (!isNaN(weight)) {
      this.portfolioService.updateStockWeight(this.portfolioId(), stockId, weight);
    }
  }

  removeStock(stockId: string): void {
    if (confirm('Are you sure you want to remove this stock?')) {
      this.portfolioService.removeStockFromPortfolio(this.portfolioId(), stockId);
    }
  }

  addStock(): void {
    if (this.newStock.ticker && this.newStock.name && this.newStock.shares > 0 && this.newStock.currentPrice > 0) {
      this.portfolioService.addStockToPortfolio(this.portfolioId(), this.newStock);
      this.resetNewStock();
      this.showAddStockModal.set(false);
    }
  }

  resetNewStock(): void {
    this.newStock = {
      ticker: '',
      name: '',
      weight: 0,
      shares: 0,
      currentPrice: 0
    };
  }

  rebalancePortfolio(): void {
    if (confirm('This will adjust your share quantities to match the assigned weights. Continue?')) {
      this.portfolioService.rebalancePortfolio(this.portfolioId());
    }
  }
}
