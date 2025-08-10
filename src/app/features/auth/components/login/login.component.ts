import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from "../../../../core/services/auth.service";
import { LoadingSpinnerComponent } from "../../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-login",
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <div class="max-w-md w-full space-y-8 p-8">
        <!-- Logo and Header -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Portfolio Management
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Sign in to manage your investment portfolios
          </p>
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Tab Navigation -->
          <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              (click)="activeTab.set('signin')"
              [class]="
                activeTab() === 'signin'
                  ? 'flex-1 py-2 px-4 text-sm font-medium text-blue-600 bg-white rounded-md shadow-sm'
                  : 'flex-1 py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700'
              "
            >
              Sign In
            </button>
            <button
              (click)="activeTab.set('signup')"
              [class]="
                activeTab() === 'signup'
                  ? 'flex-1 py-2 px-4 text-sm font-medium text-blue-600 bg-white rounded-md shadow-sm'
                  : 'flex-1 py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700'
              "
            >
              Sign Up
            </button>
          </div>

          <!-- Sign In Tab -->
          @if (activeTab() === "signin") {
            <form (ngSubmit)="signIn()" #signinForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="signinData.email"
                    name="email"
                    required
                    email
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="signinData.password"
                    name="password"
                    required
                    minlength="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <button
                    type="button"
                    (click)="showForgotPassword.set(true)"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  [disabled]="!signinForm.valid || authService.isLoading()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (authService.isLoading()) {
                    <app-loading-spinner
                      size="sm"
                      color="white"
                      [showText]="false"
                    ></app-loading-spinner>
                  } @else {
                    Sign In
                  }
                </button>
              </div>
            </form>
          }

          <!-- Sign Up Tab -->
          @if (activeTab() === "signup") {
            <form (ngSubmit)="signUp()" #signupForm="ngForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="signupData.displayName"
                    name="displayName"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="signupData.email"
                    name="email"
                    required
                    email
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    [(ngModel)]="signupData.password"
                    name="password"
                    required
                    minlength="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="!signupForm.valid || authService.isLoading()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (authService.isLoading()) {
                    <app-loading-spinner
                      size="sm"
                      color="white"
                      [showText]="false"
                    ></app-loading-spinner>
                  } @else {
                    Create Account
                  }
                </button>
              </div>
            </form>
          }

          <!-- Divider -->
          <div class="my-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500"
                  >Or continue with</span
                >
              </div>
            </div>
          </div>

          <!-- Google Sign In -->
          <button
            (click)="signInWithGoogle()"
            [disabled]="authService.isLoading()"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <!-- Error Display -->
          @if (authService.error()) {
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ authService.error() }}</p>
            </div>
          }
        </div>

        <!-- Forgot Password Modal -->
        @if (showForgotPassword()) {
          <div
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Reset Password
              </h3>
              <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="resetEmail"
                    name="resetEmail"
                    required
                    email
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    (click)="showForgotPassword.set(false)"
                    class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="!resetForm.valid || authService.isLoading()"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    Send Reset Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  activeTab = signal<"signin" | "signup">("signin");
  showForgotPassword = signal(false);

  signinData = {
    email: "",
    password: "",
  };

  signupData = {
    email: "",
    password: "",
    displayName: "",
  };

  resetEmail = "";

  async signIn(): Promise<void> {
    const success = await this.authService.signInWithEmail(
      this.signinData.email,
      this.signinData.password,
    );

    if (success) {
      this.router.navigate(["/dashboard"]);
    }
  }

  async signUp(): Promise<void> {
    const success = await this.authService.signUpWithEmail(
      this.signupData.email,
      this.signupData.password,
      this.signupData.displayName,
    );

    if (success) {
      this.router.navigate(["/dashboard"]);
    }
  }

  async signInWithGoogle(): Promise<void> {
    const success = await this.authService.signInWithGoogle();

    if (success) {
      this.router.navigate(["/dashboard"]);
    }
  }

  async resetPassword(): Promise<void> {
    const success = await this.authService.resetPassword(this.resetEmail);

    if (success) {
      this.showForgotPassword.set(false);
      this.resetEmail = "";
    }
  }
}
