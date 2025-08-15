import { inject } from '@angular/core';
import { FirebasePortfolioService } from './firebase-portfolio.service';

// Alias the Firebase service as the main PortfolioService
// This ensures all components use the database-backed service
export const PortfolioService = FirebasePortfolioService;

// Alternative approach using provider function
export function providePortfolioService() {
  return {
    provide: 'PortfolioService',
    useFactory: () => inject(FirebasePortfolioService)
  };
}
