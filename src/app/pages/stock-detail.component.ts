import { Component, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { FirebasePortfolioService } from "../services/firebase-portfolio.service";
import { Stock, StockNote } from "../models/portfolio.model";

@Component({
  selector: "app-stock-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    @if (stock() && portfolio()) {
      <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  {{ stock()!.ticker }}
                </h1>
                <p class="text-slate-600 mt-1">{{ stock()!.name }}</p>
              </div>
            </div>
          </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Market Data Column -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Price Overview -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h2 class="text-xl font-bold text-slate-900 mb-4">
                  Market Data
                </h2>

                @if (stock()!.marketData) {
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center">
                      <div class="text-3xl font-bold text-slate-900">
                        ₹{{ stock()!.marketData!.price | number: "1.2-2" }}
                      </div>
                      <div class="text-sm text-slate-500">Current Price</div>
                      <div
                        class="mt-1"
                        [class]="
                          stock()!.marketData!.changePercent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        "
                      >
                        {{ stock()!.marketData!.changePercent >= 0 ? "+" : ""
                        }}{{ stock()!.marketData!.changePercent }}%
                      </div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        {{ stock()!.marketData!.pe | number: "1.1-1" }}
                      </div>
                      <div class="text-sm text-slate-500">P/E Ratio</div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        ₹{{ stock()!.marketData!.eps | number: "1.1-1" }}
                      </div>
                      <div class="text-sm text-slate-500">EPS</div>
                    </div>

                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-900">
                        {{
                          stock()!.marketData!.dividendYield | number: "1.2-2"
                        }}%
                      </div>
                      <div class="text-sm text-slate-500">Dividend Yield</div>
                    </div>
                  </div>

                  <div
                    class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-200"
                  >
                    <div>
                      <div class="text-sm text-slate-500">Book Value</div>
                      <div class="text-lg font-semibold text-slate-900">
                        ₹{{ stock()!.marketData!.bookValue | number: "1.2-2" }}
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Market Cap</div>
                      <div class="text-lg font-semibold text-slate-900">
                        ₹{{
                          stock()!.marketData!.marketCap / 10000000
                            | number: "1.0-0"
                        }}Cr
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Debt Ratio</div>
                      <div class="text-lg font-semibold text-slate-900">
                        {{ stock()!.marketData!.debt | number: "1.1-1" }}
                      </div>
                    </div>

                    <div>
                      <div class="text-sm text-slate-500">Volume</div>
                      <div class="text-lg font-semibold text-slate-900">
                        {{
                          stock()!.marketData!.volume / 100000
                            | number: "1.0-0"
                        }}L
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-8">
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
                      No Market Data Available
                    </h3>
                    <p class="text-slate-600">
                      Market data will be fetched from API integration
                    </p>
                  </div>
                }
              </div>

              <!-- Personal Notes -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-slate-900">
                    Personal Notes
                  </h2>
                  <button
                    (click)="showAddNoteModal.set(true)"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg
                      class="w-4 h-4 inline-block mr-2"
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
                    Add Note
                  </button>
                </div>

                @if (stock()!.notes.length > 0) {
                  <div class="space-y-4">
                    @for (note of stock()!.notes; track note.id) {
                      <div class="border border-slate-200 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                          <h3 class="font-semibold text-slate-900">
                            {{ note.section }}
                          </h3>
                          <div class="flex gap-2">
                            <button
                              (click)="editNote(note)"
                              class="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              (click)="deleteNote(note.id)"
                              class="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p class="text-slate-700 whitespace-pre-wrap">
                          {{ note.content }}
                        </p>
                        <div class="text-xs text-slate-500 mt-2">
                          Updated {{ note.updatedAt | date: "short" }}
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <h3 class="text-lg font-medium text-slate-900 mb-2">
                      No Notes Yet
                    </h3>
                    <p class="text-slate-600 mb-4">
                      Add your thoughts, analysis, and strategy for this stock
                    </p>
                    <button
                      (click)="showAddNoteModal.set(true)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Your First Note
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Holdings Info Sidebar -->
            <div class="space-y-6">
              <!-- Position Summary -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h2 class="text-xl font-bold text-slate-900 mb-4">
                  Your Position
                </h2>

                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Shares Owned</span>
                    <span class="font-semibold">{{ stock()!.shares }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-slate-600">Avg. Price</span>
                    <span class="font-semibold"
                      >₹{{ stock()!.currentPrice | number: "1.2-2" }}</span
                    >
                  </div>

                  <div class="flex justify-between">
                    <span class="text-slate-600">Total Value</span>
                    <span class="font-semibold"
                      >₹{{ stock()!.totalValue | number: "1.0-0" }}</span
                    >
                  </div>

                  <div class="flex justify-between border-t pt-4">
                    <span class="text-slate-600">Portfolio Weight</span>
                    <span class="font-semibold">{{ stock()!.weight }}%</span>
                  </div>
                </div>
              </div>

              <!-- Quick Note Sections -->
              <div
                class="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
              >
                <h3 class="font-semibold text-slate-900 mb-4">
                  Quick Add Notes
                </h3>
                <div class="space-y-2">
                  @for (section of commonNoteSections; track section) {
                    <button
                      (click)="startQuickNote(section)"
                      class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {{ section }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add/Edit Note Modal -->
        @if (showAddNoteModal() || editingNote()) {
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div class="bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 class="text-2xl font-bold text-slate-900 mb-4">
                {{ editingNote() ? "Edit Note" : "Add Note" }}
              </h2>

              <form (ngSubmit)="saveNote()" #form="ngForm">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2"
                    >Section</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="noteForm.section"
                    name="section"
                    required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Why I Bought, Moat Analysis, Exit Strategy"
                  />
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-medium text-slate-700 mb-2"
                    >Content</label
                  >
                  <textarea
                    [(ngModel)]="noteForm.content"
                    name="content"
                    required
                    rows="8"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your analysis, thoughts, or strategy..."
                  ></textarea>
                </div>

                <div class="flex gap-3">
                  <button
                    type="button"
                    (click)="cancelNote()"
                    class="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="!form.valid"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ editingNote() ? "Update Note" : "Add Note" }}
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
          <h1 class="text-2xl font-bold text-slate-900 mb-4">
            Stock Not Found
          </h1>
          <a routerLink="/" class="text-blue-600 hover:text-blue-800"
            >← Back to Portfolios</a
          >
        </div>
      </div>
    }
  `,
})
export class StockDetailComponent {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(FirebasePortfolioService);

  stockId = signal<string>("");
  portfolioId = signal<string>("");

  portfolio = computed(() => {
    const pId = this.portfolioId();
    return pId ? this.portfolioService.getPortfolio(pId) : null;
  });

  stock = computed(() => {
    const p = this.portfolio();
    const sId = this.stockId();
    return p && sId ? p.stocks.find((s) => s.id === sId) : null;
  });

  showAddNoteModal = signal(false);
  editingNote = signal<StockNote | null>(null);

  noteForm = {
    section: "",
    content: "",
  };

  commonNoteSections = [
    "Why I Bought",
    "Moat Analysis",
    "Exit Strategy",
    "Risk Assessment",
    "Competitive Advantage",
    "Financial Health",
    "Growth Prospects",
    "Management Quality",
  ];

  constructor() {
    this.route.params.subscribe((params) => {
      this.stockId.set(params["id"]);
    });

    this.route.queryParams.subscribe((params) => {
      if (params["portfolio"]) {
        this.portfolioId.set(params["portfolio"]);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  startQuickNote(section: string): void {
    this.noteForm.section = section;
    this.noteForm.content = "";
    this.showAddNoteModal.set(true);
  }

  editNote(note: StockNote): void {
    this.editingNote.set(note);
    this.noteForm.section = note.section;
    this.noteForm.content = note.content;
  }

  async saveNote(): Promise<void> {
    if (this.noteForm.section.trim() && this.noteForm.content.trim()) {
      const editing = this.editingNote();
      let result = false;

      if (editing) {
        result = await this.portfolioService.updateStockNote(
          this.portfolioId(),
          this.stockId(),
          editing.id,
          this.noteForm.content.trim(),
        );
      } else {
        result = await this.portfolioService.addStockNote(
          this.portfolioId(),
          this.stockId(),
          this.noteForm.section.trim(),
          this.noteForm.content.trim(),
        );
      }

      if (result) {
        this.cancelNote();
      }
    }
  }

  cancelNote(): void {
    this.showAddNoteModal.set(false);
    this.editingNote.set(null);
    this.noteForm.section = "";
    this.noteForm.content = "";
  }

  deleteNote(noteId: string): void {
    if (confirm("Are you sure you want to delete this note?")) {
      const p = this.portfolio();
      const s = this.stock();
      if (p && s) {
        s.notes = s.notes.filter((n) => n.id !== noteId);
        this.portfolioService.updatePortfolio(p);
      }
    }
  }
}
