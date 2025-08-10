import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  imports: [CommonModule, RouterOutlet],
  template: `
    @if (authService.loading()) {
      <!-- Loading Screen -->
      <div
        class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
          >
            <svg
              class="w-8 h-8 text-white"
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
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Portfolio Manager
          </h2>
          <p class="text-gray-600">Loading...</p>
          <div class="mt-4">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
            ></div>
          </div>
        </div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styleUrl: "./app.css",
})
export class App implements OnInit {
  authService = inject(AuthService);
  title = "Portfolio Manager";

  ngOnInit() {
    console.log("🚀 Portfolio Manager App Initialized");
    // Immediate check: if no user after 1 second, redirect to login
    // setTimeout(() => {
    //   if (
    //     this.authService.getLoading()() ||
    //     !this.authService.isAuthenticated()
    //   ) {
    //     console.warn("⚠️ No user session detected, redirecting to login");
    //     window.location.href = "/login";
    //   }
    // }, 1000);

    // // Emergency fallback: if still loading after 3 seconds, force redirect
    // setTimeout(() => {
    //   if (this.authService.getLoading()()) {
    //     console.warn(
    //       "⚠️ App stuck in loading state, forcing redirect to login",
    //     );
    //     window.location.href = "/login";
    //   }
    // }, 3000);
  }
}
