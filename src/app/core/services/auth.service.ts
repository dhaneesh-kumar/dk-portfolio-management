import { Injectable, signal, OnDestroy } from "@angular/core";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  fromEventPattern,
  Subscription,
  ReplaySubject,
  map,
  Observable,
} from "rxjs";

import { User } from "../../shared/models/user.model";
import { LoggerService } from "./logger.service";
import { NotificationService } from "./notification.service";
import { AUTH_ERROR_MESSAGES } from "../constants/auth.constants";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  // Reactive state
  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);

  // Auth readiness signal
  private readonly _authReady = new ReplaySubject<boolean>(1);

  private auth: any;
  private authSubscription: Subscription | null = null;

  constructor(
    private logger: LoggerService,
    private notificationService: NotificationService,
  ) {
    this.initializeFirebaseAuth();
  }

  // Public getters
  get user() {
    return this._user.asReadonly();
  }
  get isLoading() {
    return this._isLoading.asReadonly();
  }
  get error() {
    return this._error.asReadonly();
  }

  /**
   * Returns observable that emits authentication status after initial state is resolved
   */
  authStatus$(): Observable<boolean> {
    return this._authReady.pipe(map(() => this._user() !== null));
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return {
      user: this._user(),
      isLoading: this._isLoading(),
      error: this._error(),
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<boolean> {
    return this.executeAuthAction(async () => {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        this.logger.info("Google sign-in successful", { uid: result.user.uid });
        this.notificationService.success(
          "Welcome!",
          "Successfully signed in with Google",
        );
        return true;
      }

      return false;
    });
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<boolean> {
    return this.executeAuthAction(async () => {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      if (result.user) {
        this.logger.info("Email sign-in successful", { email });
        this.notificationService.success(
          "Welcome back!",
          "Successfully signed in",
        );
        return true;
      }

      return false;
    });
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<boolean> {
    return this.executeAuthAction(async () => {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      if (result.user && displayName) {
        await updateProfile(result.user, { displayName });
      }

      if (result.user) {
        this.logger.info("Email sign-up successful", { email });
        this.notificationService.success(
          "Account created!",
          "Welcome to Portfolio Management",
        );
        return true;
      }

      return false;
    });
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<boolean> {
    return this.executeAuthAction(async () => {
      await sendPasswordResetEmail(this.auth, email);
      this.logger.info("Password reset email sent", { email });
      this.notificationService.success(
        "Reset email sent",
        "Check your email for password reset instructions",
      );
      return true;
    });
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.logger.info("User signed out successfully");
      this.notificationService.info(
        "Signed out",
        "You have been signed out successfully",
      );
    } catch (error: any) {
      this.logger.error("Sign out failed", error);
      this._error.set("Failed to sign out");
      this.notificationService.error(
        "Sign out failed",
        "An error occurred while signing out",
      );
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this._authReady.complete();
  }

  /**
   * Initialize Firebase Authentication
   */
  private initializeFirebaseAuth(): void {
    try {
      this.auth = getAuth();
      this.setupAuthListener();
    } catch (error) {
      this.logger.error("Failed to initialize Firebase Auth", error as Error);
      this.handleAuthInitializationFailure(
        "Firebase authentication not available",
      );
    }
  }

  /**
   * Setup authentication state listener
   */
  private setupAuthListener(): void {
    if (!this.auth) {
      this.logger.error("Firebase Auth not initialized");
      this.handleAuthInitializationFailure(
        "Authentication service unavailable",
      );
      return;
    }

    const authState$ = fromEventPattern<FirebaseUser | null>(
      (handler) =>
        onAuthStateChanged(this.auth, handler, (error) => handler(null)),
      (handler, unsubscribe) => unsubscribe(),
    );

    let isFirstAuthState = true;

    this.authSubscription = authState$.subscribe({
      next: (firebaseUser: FirebaseUser | null) => {
        this.handleAuthStateChange(firebaseUser, isFirstAuthState);
        if (isFirstAuthState) {
          isFirstAuthState = false;
        }
      },
      error: (error) => {
        this.logger.error("Auth state change error", error);
        this.handleAuthInitializationFailure(
          "Authentication initialization failed",
        );
      },
    });
  }

  /**
   * Handle authentication state changes
   */
  private handleAuthStateChange(
    firebaseUser: FirebaseUser | null,
    isFirstState: boolean,
  ): void {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || firebaseUser.email || "User",
        photoURL: firebaseUser.photoURL || undefined,
      };

      this._user.set(user);

      if (!isFirstState) {
        this.logger.info("User authenticated", { email: user.email });
      }
    } else {
      this._user.set(null);

      if (!isFirstState) {
        this.logger.info("User session ended");
      }
    }

    this._isLoading.set(false);
    this._authReady.next(true);
  }

  /**
   * Handle authentication initialization failure
   */
  private handleAuthInitializationFailure(errorMessage: string): void {
    this._user.set(null);
    this._isLoading.set(false);
    this._error.set(errorMessage);
    this._authReady.next(true);
  }

  /**
   * Execute authentication action with error handling
   */
  private async executeAuthAction(
    action: () => Promise<boolean>,
  ): Promise<boolean> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      return await action();
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error("Authentication action failed", error, {
        code: error.code,
      });
      this._error.set(errorMessage);
      this.notificationService.error("Authentication failed", errorMessage);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get user-friendly error message from Firebase error
   */
  private getErrorMessage(error: any): string {
    return (
      AUTH_ERROR_MESSAGES[error.code] ||
      "Authentication failed. Please try again."
    );
  }
}
