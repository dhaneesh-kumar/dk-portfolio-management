import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Portfolio Manager</h1>
          <p class="text-gray-600">Sign in to manage your investment portfolios</p>
        </div>

        @if (authService.error()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h3 class="text-red-800 font-medium text-sm">Authentication Error</h3>
                <p class="text-red-700 text-sm mt-1">{{authService.error()}}</p>
              </div>
            </div>
          </div>
        }

        @if (showSuccessMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <div>
                <h3 class="text-green-800 font-medium text-sm">Success!</h3>
                <p class="text-green-700 text-sm mt-1">{{successMessage()}}</p>
              </div>
            </div>
          </div>
        }

        <!-- Tab Navigation -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            (click)="activeTab.set('signin')"
            [class]="activeTab() === 'signin' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors">
            Sign In
          </button>
          <button
            (click)="activeTab.set('signup')"
            [class]="activeTab() === 'signup' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors">
            Sign Up
          </button>
        </div>

        <!-- Sign In Tab -->
        @if (activeTab() === 'signin') {
          <form (ngSubmit)="signInWithEmail()" #signinForm="ngForm">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  [(ngModel)]="signinData.email"
                  name="email"
                  required
                  autocomplete="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  [(ngModel)]="signinData.password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••">
              </div>
            </div>

            <button
              type="submit"
              [disabled]="!signinForm.valid || authService.loading()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4">
              @if (authService.loading()) {
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              } @else {
                Sign In
              }
            </button>

            <div class="text-center mb-4">
              <button
                type="button"
                (click)="showForgotPassword.set(true)"
                class="text-sm text-blue-600 hover:text-blue-800">
                Forgot your password?
              </button>
            </div>
          </form>
        }

        <!-- Sign Up Tab -->
        @if (activeTab() === 'signup') {
          <form (ngSubmit)="signUpWithEmail()" #signupForm="ngForm">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  [(ngModel)]="signupData.displayName"
                  name="displayName"
                  required
                  autocomplete="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  [(ngModel)]="signupData.email"
                  name="email"
                  required
                  autocomplete="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  [(ngModel)]="signupData.password"
                  name="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••">
                <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  [(ngModel)]="signupData.confirmPassword"
                  name="confirmPassword"
                  required
                  autocomplete="new-password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••">
              </div>
            </div>

            <button
              type="submit"
              [disabled]="!signupForm.valid || !passwordsMatch() || authService.loading()"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4">
              @if (authService.loading()) {
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              } @else {
                Create Account
              }
            </button>

            @if (!passwordsMatch() && signupData.confirmPassword) {
              <p class="text-red-600 text-sm text-center mb-4">Passwords do not match</p>
            }
          </form>
        }

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <button
          (click)="signInWithGoogle()"
          [disabled]="authService.loading()"
          class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          @if (authService.loading()) {
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            Signing in...
          } @else {
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          }
        </button>

        <!-- Forgot Password Modal -->
        @if (showForgotPassword()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl max-w-sm w-full p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
              <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="resetEmail"
                    name="resetEmail"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com">
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    (click)="showForgotPassword.set(false)"
                    class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="!resetForm.valid || authService.loading()"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                    Send Reset Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  
  activeTab = signal<'signin' | 'signup'>('signin');
  showForgotPassword = signal(false);
  showSuccessMessage = signal(false);
  successMessage = signal('');
  resetEmail = '';
  
  signinData = {
    email: '',
    password: ''
  };
  
  signupData = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  passwordsMatch(): boolean {
    return this.signupData.password === this.signupData.confirmPassword;
  }

  async signInWithEmail() {
    if (this.signinData.email && this.signinData.password) {
      const success = await this.authService.signInWithEmail(
        this.signinData.email,
        this.signinData.password
      );
      
      if (success) {
        this.signinData = { email: '', password: '' };
      }
    }
  }

  async signUpWithEmail() {
    if (this.signupData.email && this.signupData.password && this.passwordsMatch()) {
      const success = await this.authService.signUpWithEmail(
        this.signupData.email,
        this.signupData.password,
        this.signupData.displayName
      );
      
      if (success) {
        this.signupData = { displayName: '', email: '', password: '', confirmPassword: '' };
        this.activeTab.set('signin');
        this.showSuccessMessage.set(true);
        this.successMessage.set('Account created successfully! You are now signed in.');
        setTimeout(() => this.showSuccessMessage.set(false), 5000);
      }
    }
  }

  async signInWithGoogle() {
    await this.authService.signInWithGoogle();
  }

  async resetPassword() {
    if (this.resetEmail) {
      const success = await this.authService.resetPassword(this.resetEmail);
      
      if (success) {
        this.showForgotPassword.set(false);
        this.showSuccessMessage.set(true);
        this.successMessage.set('Password reset email sent! Check your inbox.');
        this.resetEmail = '';
        setTimeout(() => this.showSuccessMessage.set(false), 5000);
      }
    }
  }
}
