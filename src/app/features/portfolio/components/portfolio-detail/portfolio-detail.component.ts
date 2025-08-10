import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { PortfolioService } from "../../services/portfolio.service";
import { Portfolio } from "../../models/portfolio.model";

@Component({
  selector: "app-portfolio-detail",
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      @if (portfolio()) {
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button
                  (click)="goBack()"
                  class="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div>
                  <h1 class="text-3xl font-bold text-slate-900">
                    {{ portfolio()!.name }}
                  </h1>
                  <p class="text-slate-600 mt-1">
                    {{ portfolio()!.description }}
                  </p>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg
                    class="w-5 h-5 inline-block mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Rebalance
                </button>
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg
                    class="w-5 h-5 inline-block mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
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
            <div
              class="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg
                    class="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Value</p>
                  <p class="text-2xl font-bold text-slate-900">
                    ₹{{ portfolio()!.totalValue | number: "1.0-0" }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg
                    class="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Total Return</p>
                  <p class="text-2xl font-bold text-green-600">
                    +{{ portfolio()!.totalReturnPercent }}%
                  </p>
                </div>
              </div>
            </div>

            <div
              class="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg
                    class="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Holdings</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{ portfolio()!.stocks.length }}
                  </p>
                </div>
              </div>
            </div>

            <div
              class="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
            >
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    class="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Weight Check</p>
                  <p class="text-2xl font-bold text-green-600">
                    {{ getTotalWeight() }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Stock Holdings Table -->
          <div
            class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-slate-200">
              <h2 class="text-xl font-bold text-slate-900">Stock Holdings</h2>
            </div>

            @if (portfolio()!.stocks.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Shares
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Weight
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-200">
                    @for (stock of portfolio()!.stocks; track stock.id) {
                      <tr class="hover:bg-slate-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-slate-900">
                              {{ stock.ticker }}
                            </div>
                            <div class="text-sm text-slate-500">
                              {{ stock.name }}
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-slate-900">
                            ₹{{ stock.currentPrice | number: "1.2-2" }}
                          </div>
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
                        >
                          {{ stock.shares }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="text-sm text-slate-900"
                            >{{ stock.weight }}%</span
                          >
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
                        >
                          ₹{{ stock.totalValue | number: "1.0-0" }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        >
                          <div class="flex gap-2">
                            <button class="text-blue-600 hover:text-blue-900">
                              View
                            </button>
                            <button class="text-red-600 hover:text-red-900">
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center py-12">
                <svg
                  class="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                  />
                </svg>
                <h3 class="text-lg font-medium text-slate-900 mb-2">
                  No stocks added yet
                </h3>
                <p class="text-slate-600 mb-4">
                  Start building your portfolio by adding your first stock
                </p>
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Your First Stock
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-slate-900 mb-4">
              Portfolio Not Found
            </h1>
            <button
              (click)="goBack()"
              class="text-blue-600 hover:text-blue-800"
            >
              ← Back to Portfolios
            </button>
          </div>
        </div>
      }
    </div>
  `,
  standalone: false,
})
export class PortfolioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly portfolioService = inject(PortfolioService);

  portfolio = signal<Portfolio | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const portfolioId = params["id"];
      if (portfolioId) {
        this.loadPortfolio(portfolioId);
      }
    });
  }

  private async loadPortfolio(id: string): Promise<void> {
    const portfolio = await this.portfolioService.getPortfolio(id);
    this.portfolio.set(portfolio);
  }

  getTotalWeight(): number {
    const p = this.portfolio();
    if (!p) return 0;
    return p.stocks.reduce((sum, stock) => sum + stock.weight, 0);
  }

  goBack(): void {
    this.router.navigate(["/dashboard"]);
  }
}
