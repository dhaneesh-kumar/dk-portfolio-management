import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "./core/guards/auth.guard";
import { GuestGuard } from "./core/guards/guest.guard";
import { APP_CONSTANTS } from "./core/constants/app.constants";

const routes: Routes = [
  // Default redirect
  {
    path: "",
    redirectTo: APP_CONSTANTS.ROUTES.DASHBOARD,
    pathMatch: "full",
  },

  // Authentication routes (for guest users only)
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/components/login/login.component").then(
        (m) => m.LoginComponent,
      ),
    canActivate: [GuestGuard],
    data: {
      title: "Sign In",
      hideHeader: true,
    },
  },

  // Dashboard route
  {
    path: "dashboard",
    loadChildren: () =>
      import("./features/portfolio/portfolio.module").then(
        (m) => m.PortfolioModule,
      ),
    canActivate: [AuthGuard],
    data: {
      title: "Dashboard",
      breadcrumb: "Dashboard",
    },
  },

  // Portfolio routes
  {
    path: "portfolio",
    loadChildren: () =>
      import("./features/portfolio/portfolio.module").then(
        (m) => m.PortfolioModule,
      ),
    canActivate: [AuthGuard],
    data: {
      title: "Portfolios",
      breadcrumb: "Portfolios",
    },
  },


  // Wildcard route - must be last
  {
    path: "**",
    loadComponent: () =>
      import("./shared/components/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
    data: {
      title: "Page Not Found",
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Set to true for debugging
      scrollPositionRestoration: "top",
      preloadingStrategy: "lazy", // Lazy load modules
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
