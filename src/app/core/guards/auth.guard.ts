import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from 'rxjs/operators';

import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";
import { APP_CONSTANTS } from "../constants/app.constants";

/**
 * Guard that protects routes requiring authentication
 * Redirects unauthenticated users to login page
 */
export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  return authService.authStatus$().pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        logger.debug("Auth guard: User authenticated, allowing access", { route: state.url });
        return true;
      } else {
        logger.info("Auth guard: User not authenticated, redirecting to login", { 
          attemptedRoute: state.url 
        });
        
        // Store the attempted URL for redirect after login
        const returnUrl = state.url;
        return router.createUrlTree([APP_CONSTANTS.ROUTES.LOGIN], { 
          queryParams: { returnUrl } 
        });
      }
    }),
  );
};

/**
 * Convenience export for backwards compatibility
 */
export const authGuard = AuthGuard;
