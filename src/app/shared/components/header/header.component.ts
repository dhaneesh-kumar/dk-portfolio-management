import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  template: `
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Logo and Navigation -->
          <div class="flex items-center space-x-8">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-slate-900">
                {{ appName }}
              </h1>
            </div>
            
            <!-- Navigation Menu -->
            @if (user()) {
              <nav class="hidden md:flex space-x-6">
                <a 
                  [routerLink]="['/dashboard']"
                  routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                  class="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </a>
                <a 
                  [routerLink]="['/portfolio']"
                  routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                  class="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Portfolios
                </a>
                <a 
                  [routerLink]="['/stock']"
                  routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                  class="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Stocks
                </a>
              </nav>
            }
          </div>

          <!-- User Menu -->
          @if (user(); as currentUser) {
            <div class="flex items-center space-x-4">
              <!-- User Info -->
              <div class="hidden md:flex items-center space-x-3">
                @if (currentUser.photoURL) {
                  <img 
                    [src]="currentUser.photoURL" 
                    [alt]="currentUser.displayName"
                    class="h-8 w-8 rounded-full"
                  />
                } @else {
                  <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ getInitials(currentUser.displayName) }}
                    </span>
                  </div>
                }
                <span class="text-sm font-medium text-slate-700">
                  {{ currentUser.displayName }}
                </span>
              </div>

              <!-- User Dropdown -->
              <div class="relative" appClickOutside (clickOutside)="closeUserMenu()">
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [attr.aria-expanded]="showUserMenu"
                >
                  <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (showUserMenu) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div class="py-1">
                      <a
                        [routerLink]="['/profile']"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Profile Settings
                      </a>
                      <a
                        href="#"
                        class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Help & Support
                      </a>
                      <div class="border-t border-slate-100"></div>
                      <button
                        (click)="signOut()"
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <!-- Login Button for Guest Users -->
            <div class="flex items-center space-x-4">
              <a
                [routerLink]="['/login']"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  standalone: true,
  imports: []
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly appName = APP_CONSTANTS.APP_NAME;
  readonly user = this.authService.user;
  
  showUserMenu = false;

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      this.closeUserMenu();
      this.router.navigate(['/login']);
    } catch (error) {
      this.notificationService.error(
        'Sign Out Failed', 
        'An error occurred while signing out'
      );
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
