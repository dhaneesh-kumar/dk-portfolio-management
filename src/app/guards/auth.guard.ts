import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, take } from 'rxjs/operators';
import { Observable, of } from "rxjs";

export const authGuard: CanActivateFn = (
  route,
  state,
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  return authService.authStatus$().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        return inject(Router).createUrlTree(["/login"]);
      }
    }),
  );
};

export const guestGuard: CanActivateFn = (
  route,
  state,
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$().pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return true;
      } else {
        return router.createUrlTree(["/dashboard"]);
      }
    }),
  );
};
