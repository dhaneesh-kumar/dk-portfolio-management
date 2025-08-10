import { inject } from "@angular/core";
import {
  CanActivateFn,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";
import { APP_CONSTANTS } from "../constants/app.constants";

/**
 * Guard that protects routes for guest users only (e.g., login, signup)
 * Redirects authenticated users to dashboard
 */
export const GuestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  return authService.authStatus$().pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        logger.debug("Guest guard: User not authenticated, allowing access", {
          route: state.url,
        });
        return true;
      } else {
        logger.info(
          "Guest guard: User authenticated, redirecting to dashboard",
          {
            route: state.url,
          },
        );

        return router.createUrlTree([APP_CONSTANTS.ROUTES.DASHBOARD]);
      }
    }),
  );
};

/**
 * Convenience export for backwards compatibility
 */
export const guestGuard = GuestGuard;
