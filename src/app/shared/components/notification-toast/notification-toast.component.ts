import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";

import {
  NotificationService,
  Notification,
} from "../../../core/services/notification.service";

@Component({
  selector: "app-notification-toast",
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3">
      @for (notification of notifications$ | async; track notification.id) {
        <div
          class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
          [class]="getNotificationClasses(notification.type)"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6"
                  [class]="getIconClasses(notification.type)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  @switch (notification.type) {
                    @case ("success") {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    }
                    @case ("error") {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    }
                    @case ("warning") {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    }
                    @default {
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    }
                  }
                </svg>
              </div>

              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-slate-900">
                  {{ notification.title }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ notification.message }}
                </p>

                @if (notification.actions && notification.actions.length > 0) {
                  <div class="mt-3 flex space-x-2">
                    @for (action of notification.actions; track action.label) {
                      <button
                        (click)="executeAction(action, notification.id)"
                        class="bg-white rounded-md text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {{ action.label }}
                      </button>
                    }
                  </div>
                }
              </div>

              <div class="ml-4 flex-shrink-0 flex">
                <button
                  (click)="dismiss(notification.id)"
                  class="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span class="sr-only">Close</span>
                  <svg
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Progress bar for auto-dismiss -->
          @if (notification.duration && notification.duration > 0) {
            <div class="h-1 bg-slate-200">
              <div
                class="h-full transition-all ease-linear"
                [class]="getProgressBarClasses(notification.type)"
                [style.animation]="
                  'shrink ' + notification.duration + 'ms linear'
                "
              ></div>
            </div>
          }
        </div>
      }
    </div>

    <style>
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
    </style>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class NotificationToastComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  notifications$: Observable<Notification[]>;

  constructor() {
    this.notifications$ = this.notificationService.getNotifications();
  }

  ngOnInit(): void {
    // Component is initialized and ready to display notifications
  }

  dismiss(id: string): void {
    this.notificationService.remove(id);
  }

  executeAction(action: any, notificationId: string): void {
    action.action();
    this.dismiss(notificationId);
  }

  getNotificationClasses(type: string): string {
    const baseClasses = "border-l-4";

    switch (type) {
      case "success":
        return `${baseClasses} border-green-500`;
      case "error":
        return `${baseClasses} border-red-500`;
      case "warning":
        return `${baseClasses} border-yellow-500`;
      case "info":
      default:
        return `${baseClasses} border-blue-500`;
    }
  }

  getIconClasses(type: string): string {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
      default:
        return "text-blue-500";
    }
  }

  getProgressBarClasses(type: string): string {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
      default:
        return "bg-blue-500";
    }
  }
}
