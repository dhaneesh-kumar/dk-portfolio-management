import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebasePortfolioService } from '../services/firebase-portfolio.service';
import { SharePermissions, PortfolioShare } from '../models/portfolio.model';

@Component({
  selector: 'app-share-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Share Portfolio</h2>
              <button 
                (click)="close()"
                class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Share Form -->
            <form (ngSubmit)="sharePortfolio()" #shareForm="ngForm">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Share with Email
                </label>
                <input 
                  type="email" 
                  [(ngModel)]="shareData.email"
                  name="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="colleague@company.com">
              </div>

              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea 
                  [(ngModel)]="shareData.message"
                  name="message"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hey! I'd like to share my portfolio with you for feedback..."></textarea>
              </div>

              <!-- Permissions -->
              <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                <div class="space-y-3">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="shareData.permissions.canComment"
                      name="canComment"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-3 text-sm text-gray-700">
                      <strong>Can Comment</strong> - Add suggestions and feedback
                    </span>
                  </label>

                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="shareData.permissions.canEdit"
                      name="canEdit"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-3 text-sm text-gray-700">
                      <strong>Can Edit Portfolio</strong> - Modify portfolio details
                    </span>
                  </label>

                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="shareData.permissions.canEditStocks"
                      name="canEditStocks"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-3 text-sm text-gray-700">
                      <strong>Can Edit Stocks</strong> - Add/remove stocks from portfolio
                    </span>
                  </label>

                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="shareData.permissions.canEditWeights"
                      name="canEditWeights"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-3 text-sm text-gray-700">
                      <strong>Can Edit Weights</strong> - Modify stock allocation weights
                    </span>
                  </label>

                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="shareData.permissions.canAddNotes"
                      name="canAddNotes"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="ml-3 text-sm text-gray-700">
                      <strong>Can Add Notes</strong> - Add personal notes to stocks
                    </span>
                  </label>
                </div>
              </div>

              @if (error()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-700 text-sm">{{error()}}</p>
                </div>
              }

              <div class="flex gap-3">
                <button 
                  type="button"
                  (click)="close()"
                  class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit"
                  [disabled]="!shareForm.valid || loading()"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (loading()) {
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sharing...
                    </div>
                  } @else {
                    Share Portfolio
                  }
                </button>
              </div>
            </form>

            <!-- Existing Shares -->
            @if (existingShares().length > 0) {
              <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Currently Shared With</h3>
                <div class="space-y-3">
                  @for (share of existingShares(); track share.id) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium text-gray-900">{{share.sharedWithEmail}}</p>
                        <p class="text-sm text-gray-600">
                          Shared {{share.createdAt | date:'short'}}
                        </p>
                        <div class="flex gap-2 mt-1">
                          @if (share.permissions.canComment) {
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Comment
                            </span>
                          }
                          @if (share.permissions.canEdit) {
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Edit
                            </span>
                          }
                          @if (share.permissions.canEditStocks) {
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Stocks
                            </span>
                          }
                        </div>
                      </div>
                      <button 
                        (click)="removeShare(share.id)"
                        class="text-red-600 hover:text-red-800 text-sm">
                        Remove
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class SharePortfolioComponent {
  @Input() portfolioId: string = '';
  @Input() portfolioName: string = '';
  @Output() shareComplete = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  private portfolioService = inject(FirebasePortfolioService);
  
  isVisible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  existingShares = signal<PortfolioShare[]>([]);

  shareData = {
    email: '',
    message: '',
    permissions: {
      canEdit: false,
      canEditStocks: false,
      canEditWeights: false,
      canAddNotes: false,
      canComment: true // Default to allowing comments
    } as SharePermissions
  };

  show() {
    this.isVisible.set(true);
    this.loadExistingShares();
  }

  close() {
    this.isVisible.set(false);
    this.resetForm();
    this.closeModal.emit();
  }

  async loadExistingShares() {
    if (!this.portfolioId) return;
    
    try {
      const shares = await this.portfolioService.getPortfolioShares(this.portfolioId);
      this.existingShares.set(shares);
    } catch (error) {
      console.error('Error loading existing shares:', error);
    }
  }

  async sharePortfolio() {
    if (!this.shareData.email.trim() || !this.portfolioId) return;

    try {
      this.loading.set(true);
      this.error.set(null);

      const success = await this.portfolioService.sharePortfolio(
        this.portfolioId,
        this.shareData.email.trim(),
        this.shareData.permissions,
        this.shareData.message.trim()
      );

      if (success) {
        this.shareComplete.emit();
        await this.loadExistingShares();
        this.resetForm();
      } else {
        this.error.set('Failed to share portfolio. Please try again.');
      }
    } catch (error: any) {
      console.error('Error sharing portfolio:', error);
      this.error.set(error.message || 'Failed to share portfolio');
    } finally {
      this.loading.set(false);
    }
  }

  async removeShare(shareId: string) {
    if (!confirm('Are you sure you want to remove this share?')) return;

    try {
      const success = await this.portfolioService.removePortfolioShare(shareId);
      if (success) {
        await this.loadExistingShares();
      }
    } catch (error) {
      console.error('Error removing share:', error);
    }
  }

  private resetForm() {
    this.shareData = {
      email: '',
      message: '',
      permissions: {
        canEdit: false,
        canEditStocks: false,
        canEditWeights: false,
        canAddNotes: false,
        canComment: true
      }
    };
    this.error.set(null);
  }
}
