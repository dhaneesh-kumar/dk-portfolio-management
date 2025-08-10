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
import { User } from "../models/portfolio.model";
import { fromEventPattern, Subscription } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class AuthService implements OnDestroy {
  user = signal<User | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private auth: any;
  private authSubscription: Subscription | null = null;
  private authResolved = false;

  constructor() {
    this.initFirebaseAuth();
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

  isAuthenticated() {
    // Only authenticated if auth state has been resolved and user is set
    return this.authResolved && this.user() !== null;
  }

  private initAuthListener() {
    if (!this.auth) {
      console.error("❌ Firebase Auth not initialized");
      this.user.set(null);
      this.loading.set(false);
      return;
    }

    // Create an observable from the onAuthStateChanged listener
    const authState$ = fromEventPattern< FirebaseUser | null >(
      (handler) => onAuthStateChanged(this.auth, handler, (error) => handler(null)),
      (handler, unsubscribe) => unsubscribe()
    );

    let firstAuthState = true;
    this.authSubscription = authState$.subscribe({
      next: (firebaseUser: FirebaseUser | null) => {
        if (firstAuthState) {
          this.authResolved = true;
          firstAuthState = false;
        }
        console.log(
          "🔄 Auth state changed:",
          firebaseUser ? firebaseUser.email : "No user",
        );
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
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.authResolved = true;
        console.error("❌ Auth state change error:", error);
        this.user.set(null);
        this.loading.set(false);
        this.error.set("Authentication initialization failed");
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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

  async signInWithEmail(email: string, password: string): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      if (result.user) {
        console.log("✅ Email sign-in successful");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ Email sign-in failed:", error);
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      if (result.user && displayName) {
        // Update the user's display name
        await updateProfile(result.user, { displayName });
      }

      if (result.user) {
        console.log("✅ Email sign-up successful");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ Email sign-up failed:", error);
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);

      await sendPasswordResetEmail(this.auth, email);
      console.log("✅ Password reset email sent");
      return true;
    } catch (error: any) {
      console.error("❌ Password reset failed:", error);
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
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/operation-not-allowed":
        return "Email/password authentication is not enabled.";
      default:
        return "Authentication failed. Please try again.";
    }
  }
}
