import { Injectable, signal } from "@angular/core";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { User } from "../models/portfolio.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth: any;
  private user = signal<User | null>(null);
  private loading = signal<boolean>(true);
  private error = signal<string | null>(null);

  constructor() {
    this.initFirebaseAuth();

    // Emergency fallback: if Firebase doesn't initialize within 2 seconds,
    // assume no user and redirect to login
    setTimeout(() => {
      if (this.loading()) {
        console.warn("⚠️ Firebase taking too long, assuming no user session");
        this.user.set(null);
        this.loading.set(false);
      }
    }, 2000);
  }

  private initFirebaseAuth() {
    try {
      this.auth = getAuth();
      this.initAuthListener();
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Auth:", error);
      // If Firebase fails to initialize, set user to null and stop loading
      this.user.set(null);
      this.loading.set(false);
      this.error.set("Firebase authentication not available");
    }
  }

  getUser() {
    return this.user.asReadonly();
  }

  getLoading() {
    return this.loading.asReadonly();
  }

  getError() {
    return this.error.asReadonly();
  }

  isAuthenticated() {
    return this.user() !== null;
  }

  private initAuthListener() {
    if (!this.auth) {
      console.error("❌ Firebase Auth not initialized");
      this.user.set(null);
      this.loading.set(false);
      return;
    }

    try {
      // Add a timeout to prevent infinite loading
      const authTimeout = setTimeout(() => {
        console.warn("⚠️ Auth initialization timed out, redirecting to login");
        this.user.set(null);
        this.loading.set(false);
        // Force redirect to login after timeout
        window.location.href = "/login";
      }, 3000); // Reduced to 3 seconds

      onAuthStateChanged(
        this.auth,
        (firebaseUser: FirebaseUser | null) => {
          clearTimeout(authTimeout); // Clear timeout once auth state is determined

          if (firebaseUser) {
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName:
                firebaseUser.displayName || firebaseUser.email || "User",
              photoURL: firebaseUser.photoURL || undefined,
            };
            this.user.set(user);
            console.log("✅ User authenticated:", user.email);
          } else {
            this.user.set(null);
            console.log("📝 No user session found, redirecting to login");
            // Immediately redirect to login if no user
            setTimeout(() => {
              if (!this.isAuthenticated()) {
                window.location.href = "/login";
              }
            }, 100);
          }
          this.loading.set(false);
        },
        (error) => {
          clearTimeout(authTimeout);
          console.error("❌ Auth state change error:", error);
          this.user.set(null);
          this.loading.set(false);
          this.error.set("Authentication initialization failed");
          // Redirect to login on error
          setTimeout(() => (window.location.href = "/login"), 1000);
        },
      );
    } catch (error) {
      console.error("❌ Failed to initialize auth listener:", error);
      this.user.set(null);
      this.loading.set(false);
      this.error.set("Authentication service unavailable");
      // Redirect to login on error
      setTimeout(() => (window.location.href = "/login"), 1000);
    }
  }

  async signInWithGoogle(): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        console.log("✅ Google sign-in successful");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ Google sign-in failed:", error);
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log("✅ User signed out successfully");
    } catch (error: any) {
      console.error("❌ Sign out failed:", error);
      this.error.set("Failed to sign out");
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait and try again later.";
      default:
        return "Authentication failed. Please try again.";
    }
  }
}
