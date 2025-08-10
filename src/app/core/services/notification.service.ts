import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private readonly defaultDuration = 5000; // 5 seconds

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 0 // Error notifications don't auto-dismiss by default
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  clear(): void {
    this.notifications$.next([]);
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? this.defaultDuration
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, fullNotification]);

    // Auto-remove notification after duration
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
