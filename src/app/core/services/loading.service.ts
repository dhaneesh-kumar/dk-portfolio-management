import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  /**
   * Get global loading state
   */
  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Set global loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set loading state for a specific key
   */
  setLoadingFor(key: string, loading: boolean): void {
    if (loading) {
      this.loadingMap.set(key, loading);
    } else {
      this.loadingMap.delete(key);
    }

    // Update global loading state based on any active loading states
    this.loadingSubject.next(this.loadingMap.size > 0);
  }

  /**
   * Get loading state for a specific key
   */
  getLoadingFor(key: string): boolean {
    return this.loadingMap.get(key) || false;
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingMap.clear();
    this.loadingSubject.next(false);
  }
}
