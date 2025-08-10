import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PortfolioService } from '../../services/portfolio.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-portfolio-list',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">My Portfolios</h2>
              <p class="text-slate-600 mt-1">
                Manage your investment portfolios
              </p>
            </div>
            <button
              (click)="createPortfolio()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create Portfolio
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        @if (portfolioService.isLoading()) {
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-slate-600">Loading portfolios...</p>
          </div>
        } @else if (portfolioService.error()) {
          <!-- Error State -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="text-red-800 font-medium">Error Loading Data</h3>
                <p class="text-red-700 text-sm mt-1">{{ portfolioService.error() }}</p>
              </div>
            </div>
          </div>
        } @else {
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Value</p>
                  <p class="text-2xl font-bold text-slate-900">
                    ₹{{ portfolioService.totalPortfolioValue() | number: '1.0-0' }}
                  </p>
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
                  <p class="text-sm font-medium text-slate-600">Average Return</p>
                  <p class="text-2xl font-bold text-green-600">
                    +{{ portfolioService.averageReturn() }}%
                  </p>
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
                  <p class="text-sm font-medium text-slate-600">Portfolios</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{ portfolioService.portfolios().length }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Portfolio Grid -->
          @if (portfolioService.portfolios().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (portfolio of portfolioService.portfolios(); track portfolio.id) {
                <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                     (click)="openPortfolio(portfolio.id)">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-slate-900">{{ portfolio.name }}</h3>
                    <div class="text-right">
                      <div class="text-lg font-semibold text-slate-900">
                        ₹{{ portfolio.totalValue | number: '1.0-0' }}
                      </div>
                      <div class="text-sm text-green-600">
                        +{{ portfolio.totalReturnPercent }}%
                      </div>
                    </div>
                  </div>
                  
                  <p class="text-slate-600 text-sm mb-4">{{ portfolio.description }}</p>
                  
                  <div class="flex items-center justify-between text-sm text-slate-500">
                    <span>{{ portfolio.stocks.length }} stocks</span>
                    <span>{{ portfolio.updatedAt | date:'short' }}</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Empty State -->
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"/>
              </svg>
              <h3 class="text-lg font-medium text-slate-900 mb-2">No portfolios yet</h3>
              <p class="text-slate-600 mb-4">Start building your investment portfolio today</p>
              <button
                (click)="createPortfolio()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Portfolio
              </button>
            </div>
          }
        }
      </main>
    </div>
  `,
  standalone: false
})
export class PortfolioListComponent implements OnInit {
  readonly portfolioService = inject(PortfolioService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.portfolioService.loadPortfolios();
  }

  createPortfolio(): void {
    // For now, just show a notification
    this.notificationService.info('Coming Soon', 'Portfolio creation functionality will be available soon');
  }

  openPortfolio(portfolioId: string): void {
    this.router.navigate(['/portfolio', portfolioId]);
  }
}
