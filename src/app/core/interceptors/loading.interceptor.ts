import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading indicator for specific requests
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    // Increment active requests and show loading
    this.activeRequests++;
    this.loadingService.setLoading(true);

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement active requests and hide loading if no active requests
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }

  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip loading for requests with specific headers
    if (request.headers.has('Skip-Loading')) {
      return true;
    }

    // Skip loading for polling requests or real-time updates
    if (request.url.includes('/ping') || request.url.includes('/health')) {
      return true;
    }

    // Skip loading for background data refresh
    if (request.headers.has('Background-Request')) {
      return true;
    }

    return false;
  }
}
