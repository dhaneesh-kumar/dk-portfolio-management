import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDetailEnhancedComponent } from '../features/portfolio/components/portfolio-detail/portfolio-detail-enhanced.component';
import { Portfolio, Stock } from '../features/portfolio/models/portfolio.model';

@Component({
  selector: 'app-portfolio-test-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div class="max-w-6xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">
            🤖 Portfolio Refresh Demo
          </h1>
          <p class="text-slate-600">
            Test the Gemini AI price refresh functionality with a sample portfolio
          </p>
        </header>

        @if (!mockPortfolio()) {
          <div class="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 class="text-xl font-semibold text-slate-900 mb-4">Create Demo Portfolio</h2>
            <p class="text-slate-600 mb-6">Click below to create a sample portfolio with popular Indian stocks</p>
            <button
              (click)="createMockPortfolio()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Sample Portfolio
            </button>
          </div>
        } @else {
          <!-- Portfolio Summary -->
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">{{ mockPortfolio()!.name }}</h2>
                <p class="text-slate-600">{{ mockPortfolio()!.description }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-slate-600">Total Value</p>
                <p class="text-3xl font-bold text-green-600">
                  ₹{{ mockPortfolio()!.totalValue | number: "1.0-0" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Refresh Controls -->
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">🤖 Gemini AI Price Refresh</h3>
            <div class="flex items-center gap-4">
              <button
                (click)="refreshPrices()"
                [disabled]="isRefreshing()"
                class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                @if (isRefreshing()) {
                  <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6h2z" opacity="0.75" />
                  </svg>
                  Refreshing with Gemini AI...
                } @else {
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh All Prices
                }
              </button>
              
              <div class="text-sm text-slate-600">
                @if (lastRefreshed()) {
                  Last refreshed: {{ getTimeAgo(lastRefreshed()!) }}
                } @else {
                  Never refreshed
                }
              </div>
            </div>

            @if (refreshMessage()) {
              <div class="mt-4 px-4 py-3 rounded-lg border"
                [class]="refreshMessage()!.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'"
              >
                {{ refreshMessage()!.text }}
              </div>
            }
          </div>

          <!-- Stock List -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200">
              <h3 class="text-lg font-semibold text-slate-900">Portfolio Holdings</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shares</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  @for (stock of mockPortfolio()!.stocks; track stock.id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div class="text-sm font-medium text-slate-900">{{ stock.ticker }}</div>
                          <div class="text-sm text-slate-500">{{ stock.name }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-slate-900">
                          ₹{{ stock.currentPrice | number: "1.2-2" }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {{ stock.shares }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        ₹{{ stock.totalValue | number: "1.0-0" }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {{ stock.updatedAt ? getTimeAgo(stock.updatedAt) : 'Initial' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PortfolioTestDemoComponent {
  mockPortfolio = signal<Portfolio | null>(null);
  isRefreshing = signal(false);
  lastRefreshed = signal<Date | null>(null);
  refreshMessage = signal<{type: 'success' | 'error', text: string} | null>(null);

  createMockPortfolio(): void {
    const stocks: Stock[] = [
      {
        id: '1',
        ticker: 'RELIANCE',
        name: 'Reliance Industries Limited',
        exchange: 'NSE',
        weight: 25,
        shares: 10,
        quantity: 10,
        currentPrice: 2450,
        totalValue: 24500,
        notes: [],
        priceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2', 
        ticker: 'TCS',
        name: 'Tata Consultancy Services Limited',
        exchange: 'NSE',
        weight: 20,
        shares: 5,
        quantity: 5,
        currentPrice: 3520,
        totalValue: 17600,
        notes: [],
        priceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        ticker: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        exchange: 'NSE',
        weight: 15,
        shares: 8,
        quantity: 8,
        currentPrice: 1680,
        totalValue: 13440,
        notes: [],
        priceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        ticker: 'INFY',
        name: 'Infosys Limited',
        exchange: 'NSE',
        weight: 15,
        shares: 12,
        quantity: 12,
        currentPrice: 1420,
        totalValue: 17040,
        notes: [],
        priceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        ticker: 'ITC',
        name: 'ITC Limited',
        exchange: 'NSE',
        weight: 10,
        shares: 50,
        quantity: 50,
        currentPrice: 450,
        totalValue: 22500,
        notes: [],
        priceHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0);

    const portfolio: Portfolio = {
      id: 'demo-portfolio-1',
      name: 'Demo AI-Powered Portfolio',
      description: 'Sample portfolio for testing Gemini AI price refresh functionality',
      type: 'equity',
      stocks: stocks,
      totalValue: totalValue,
      totalReturn: 5280,
      totalReturnPercent: 5.89,
      budget: 100000,
      maxStocks: 10,
      maxStockAllocationPercent: 30,
      availableCash: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'demo-user',
      ownerEmail: 'demo@example.com'
    };

    this.mockPortfolio.set(portfolio);
  }

  async refreshPrices(): Promise<void> {
    const portfolio = this.mockPortfolio();
    if (!portfolio || this.isRefreshing()) {
      return;
    }

    this.isRefreshing.set(true);
    this.refreshMessage.set(null);

    try {
      // Simulate API calls to Gemini for each stock
      const priceUpdates = await Promise.all(
        portfolio.stocks.map(async (stock) => {
          // Simulate random price changes (-5% to +5%)
          const changePercent = (Math.random() - 0.5) * 0.1;
          const newPrice = stock.currentPrice * (1 + changePercent);
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          return {
            ticker: stock.ticker,
            newPrice: Number(newPrice.toFixed(2)),
            change: Number((newPrice - stock.currentPrice).toFixed(2))
          };
        })
      );

      // Update the portfolio with new prices
      const updatedStocks = portfolio.stocks.map(stock => {
        const priceUpdate = priceUpdates.find(p => p.ticker === stock.ticker);
        if (priceUpdate) {
          return {
            ...stock,
            currentPrice: priceUpdate.newPrice,
            totalValue: priceUpdate.newPrice * stock.shares,
            updatedAt: new Date()
          };
        }
        return stock;
      });

      const updatedTotalValue = updatedStocks.reduce((sum, stock) => sum + stock.totalValue, 0);

      this.mockPortfolio.set({
        ...portfolio,
        stocks: updatedStocks,
        totalValue: updatedTotalValue,
        updatedAt: new Date()
      });

      this.lastRefreshed.set(new Date());
      this.showSuccessMessage(`Successfully updated prices for ${priceUpdates.length} stocks using Gemini AI!`);

    } catch (error) {
      console.error('Error refreshing prices:', error);
      this.showErrorMessage('Failed to refresh stock prices. Please try again.');
    } finally {
      this.isRefreshing.set(false);
    }
  }

  private showSuccessMessage(message: string): void {
    this.refreshMessage.set({ type: 'success', text: message });
    setTimeout(() => {
      if (this.refreshMessage()?.type === 'success') {
        this.refreshMessage.set(null);
      }
    }, 5000);
  }

  private showErrorMessage(message: string): void {
    this.refreshMessage.set({ type: 'error', text: message });
    setTimeout(() => {
      if (this.refreshMessage()?.type === 'error') {
        this.refreshMessage.set(null);
      }
    }, 8000);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  }
}