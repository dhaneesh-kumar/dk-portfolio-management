import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";

import { NotificationService } from "../services/notification.service";
import { LoggerService } from "../services/logger.service";
import { APP_CONSTANTS } from "../constants/app.constants";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private logger: LoggerService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      }),
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = "An unexpected error occurred";
    let errorTitle = "Error";

    switch (error.status) {
      case 0:
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again.";
        break;
      case 400:
        errorTitle = "Bad Request";
        errorMessage =
          error.error?.message || "Invalid request. Please check your input.";
        break;
      case 401:
        errorTitle = "Unauthorized";
        errorMessage = "Your session has expired. Please log in again.";
        this.handleUnauthorized();
        break;
      case 403:
        errorTitle = "Access Denied";
        errorMessage = "You do not have permission to perform this action.";
        break;
      case 404:
        errorTitle = "Not Found";
        errorMessage = "The requested resource was not found.";
        break;
      case 409:
        errorTitle = "Conflict";
        errorMessage =
          error.error?.message ||
          "A conflict occurred while processing your request.";
        break;
      case 422:
        errorTitle = "Validation Error";
        errorMessage =
          this.formatValidationErrors(error.error?.errors) ||
          "Please check your input and try again.";
        break;
      case 429:
        errorTitle = "Rate Limited";
        errorMessage = "Too many requests. Please wait a moment and try again.";
        break;
      case 500:
        errorTitle = "Server Error";
        errorMessage = "A server error occurred. Please try again later.";
        break;
      case 503:
        errorTitle = "Service Unavailable";
        errorMessage =
          "The service is temporarily unavailable. Please try again later.";
        break;
      default:
        errorMessage =
          error.error?.message || `An error occurred (Status: ${error.status})`;
    }

    // Log the error
    this.logger.error(`HTTP Error ${error.status}:`, error, {
      url: error.url,
      message: errorMessage,
    });

    // Show user notification
    this.notificationService.error(errorTitle, errorMessage);
  }

  private handleUnauthorized(): void {
    // Clear any stored authentication data
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);

    // Redirect to login page
    this.router.navigate([APP_CONSTANTS.ROUTES.LOGIN]);
  }

  private formatValidationErrors(errors: any): string {
    if (!errors || typeof errors !== "object") {
      return "";
    }

    const errorMessages = Object.keys(errors)
      .map((key) => {
        const fieldErrors = Array.isArray(errors[key])
          ? errors[key]
          : [errors[key]];
        return `${key}: ${fieldErrors.join(", ")}`;
      })
      .join("\n");

    return errorMessages;
  }
}
