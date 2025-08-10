import { Injectable, signal } from '@angular/core';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { User } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private user = signal<User | null>(null);
  private loading = signal<boolean>(true);
  private error = signal<string | null>(null);

  constructor() {
    this.initAuthListener();
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
    onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email || 'User',
          photoURL: firebaseUser.photoURL || undefined
        };
        this.user.set(user);
        console.log('✅ User authenticated:', user.email);
      } else {
        this.user.set(null);
        console.log('📝 User signed out');
      }
      this.loading.set(false);
    });
  }

  async signInWithGoogle(): Promise<boolean> {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        console.log('✅ Google sign-in successful');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error);
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      this.error.set('Failed to sign out');
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait and try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
