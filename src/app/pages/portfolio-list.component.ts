import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { FirebasePortfolioService } from "../services/firebase-portfolio.service";
import { Portfolio } from "../models/portfolio.model";
import { FirebaseSetupComponent } from "../components/firebase-setup.component";
import { HeaderComponent } from "../components/header.component";
import { SharePortfolioComponent } from "../components/share-portfolio.component";

@Component({
  selector: "app-portfolio-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FirebaseSetupComponent,
    HeaderComponent,
    SharePortfolioComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Header -->
      <app-header></app-header>

      <!-- Create Portfolio Button -->
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
              (click)="showCreateModal.set(true)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
              Create Portfolio
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        @if (loading()) {
          <div class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <p class="mt-4 text-slate-600">Loading portfolios...</p>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div class="flex items-center">
              <svg
                class="w-6 h-6 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 class="text-red-800 font-medium">Error Loading Data</h3>
                <p class="text-red-700 text-sm mt-1">{{ error() }}</p>
                <p class="text-red-700 text-sm">
                  The app is running with sample data. Please configure Firebase
                  to enable data persistence.
                </p>
              </div>
            </div>
          </div>
        } @else {
          <!-- Firebase Setup Instructions -->
          <app-firebase-setup></app-firebase-setup>

          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <p class="text-sm font-medium text-slate-600">Total Value</p>
                  <p class="text-2xl font-bold text-slate-900">
                    ₹{{ getTotalValue() | number: "1.0-0" }}
                  </p>
                </div>
              </div>
            </div>

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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-slate-600">Portfolios</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{ portfolios().length }}
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
                  <p class="text-sm font-medium text-slate-600">Avg Return</p>
                  <p class="text-2xl font-bold text-green-600">
                    +{{ getAverageReturn() }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Portfolio Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (portfolio of portfolios(); track portfolio.id) {
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div class="p-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-xl font-bold text-slate-900">
                          {{ portfolio.name }}
                        </h3>
                        @if (portfolio.isTemplate) {
                          <span
                            class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >Template</span
                          >
                        }
                      </div>
                      <p class="text-slate-600 text-sm mb-4">
                        {{ portfolio.description }}
                      </p>

                      <div class="space-y-3">
                        <div class="flex justify-between items-center">
                          <span class="text-sm text-slate-600"
                            >Total Value</span
                          >
                          <span class="font-semibold text-slate-900"
                            >₹{{ portfolio.totalValue | number: "1.0-0" }}</span
                          >
                        </div>

                        <div class="flex justify-between items-center">
                          <span class="text-sm text-slate-600">Return</span>
                          <span
                            class="font-semibold"
                            [class]="
                              portfolio.totalReturnPercent >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            "
                          >
                            {{ portfolio.totalReturnPercent >= 0 ? "+" : ""
                            }}{{ portfolio.totalReturnPercent }}%
                          </span>
                        </div>

                        <div class="flex justify-between items-center">
                          <span class="text-sm text-slate-600">Stocks</span>
                          <span class="font-semibold text-slate-900">{{
                            portfolio.stocks.length
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 flex gap-3">
                    <a
                      [routerLink]="['/portfolio', portfolio.id]"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      View Portfolio
                    </a>
                    @if (!portfolio.isTemplate) {
                      <button
                        (click)="deletePortfolio(portfolio.id)"
                        class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Empty State -->
          @if (portfolios().length === 0) {
            <div class="text-center py-12">
              <svg
                class="w-24 h-24 text-slate-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 class="text-xl font-medium text-slate-900 mb-2">
                No portfolios yet
              </h3>
              <p class="text-slate-600 mb-6">
                Create your first portfolio to start tracking your investments
              </p>
              <button
                (click)="showCreateModal.set(true)"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Portfolio
              </button>
            </div>
          }
        }
      </main>

      <!-- Create Portfolio Modal -->
      @if (showCreateModal()) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-white rounded-xl max-w-md w-full p-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">
              Create New Portfolio
            </h2>

            <form (ngSubmit)="createPortfolio()" #form="ngForm">
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Portfolio Name</label
                >
                <input
                  type="text"
                  [(ngModel)]="newPortfolioName"
                  name="name"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., My Growth Portfolio"
                />
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >Description</label
                >
                <textarea
                  [(ngModel)]="newPortfolioDescription"
                  name="description"
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your investment strategy..."
                ></textarea>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  (click)="showCreateModal.set(false)"
                  class="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!form.valid"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class PortfolioListComponent {
  private portfolioService = inject(FirebasePortfolioService);

  portfolios = this.portfolioService.getPortfolios();
  loading = this.portfolioService.getLoading();
  error = this.portfolioService.getError();
  showCreateModal = signal(false);
  newPortfolioName = "";
  newPortfolioDescription = "";

  getTotalValue(): number {
    return this.portfolios().reduce(
      (sum, portfolio) => sum + portfolio.totalValue,
      0,
    );
  }

  getAverageReturn(): string {
    const portfolios = this.portfolios();
    if (portfolios.length === 0) return "0.0";

    const avgReturn =
      portfolios.reduce(
        (sum, portfolio) => sum + portfolio.totalReturnPercent,
        0,
      ) / portfolios.length;
    return avgReturn.toFixed(1);
  }

  async createPortfolio(): Promise<void> {
    if (this.newPortfolioName.trim()) {
      const result = await this.portfolioService.createPortfolio(
        this.newPortfolioName.trim(),
        this.newPortfolioDescription.trim(),
      );

      if (result) {
        this.newPortfolioName = "";
        this.newPortfolioDescription = "";
        this.showCreateModal.set(false);
      }
    }
  }

  async deletePortfolio(id: string): Promise<void> {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      await this.portfolioService.deletePortfolio(id);
    }
  }
}
