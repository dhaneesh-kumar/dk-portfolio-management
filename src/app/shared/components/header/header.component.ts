import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and Navigation -->
          <div class="flex items-center space-x-8">
            <a routerLink="/dashboard" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
              >
                <img src="/assets/logo.jpeg" alt="Logo" class="h-6" />
              </div>
              <span class="text-xl font-bold text-gray-900"
                >Portfolio Manager</span
              >
            </a>

            <nav class="hidden md:flex space-x-6">
              <a
                routerLink="/dashboard"
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors"
              >
                Portfolios
              </a>
            </nav>
          </div>

          <!-- User Menu -->
          @if (authService.user()) {
            <div class="flex items-center space-x-4">
              <!-- User Info -->
              <div class="flex items-center space-x-3">
                @if (authService.user()?.photoURL) {
                  <img
                    [src]="authService.user()?.photoURL"
                    [alt]="authService.user()?.displayName"
                    class="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                } @else {
                  <div
                    class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                }

                <div class="hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">
                    {{ authService.user()?.displayName }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ authService.user()?.email }}
                  </p>
                </div>
              </div>

              <!-- Logout Button -->
              <button
                (click)="signOut()"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          } @else {
            <div class="flex items-center space-x-4">
              <a
                routerLink="/login">Login</a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authService = inject(AuthService);

  async signOut() {
    if (confirm("Are you sure you want to sign out?")) {
      await this.authService.signOut();
    }
  }
}
