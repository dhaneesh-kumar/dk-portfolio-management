import { Routes } from "@angular/router";
import { PortfolioListComponent } from "./pages/portfolio-list.component";
import { PortfolioDetailComponent } from "./pages/portfolio-detail.component";
import { StockDetailComponent } from "./pages/stock-detail.component";
import { NotesDemoComponent } from "./pages/notes-demo.component";
import { StockSearchDemoComponent } from "./pages/stock-search-demo.component";
import { PortfolioTestDemoComponent } from "./pages/portfolio-test-demo.component";
import { LoginComponent } from "./core/components/login.component";
import { authGuard, guestGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "dashboard", component: PortfolioListComponent, canActivate: [authGuard] },
  {
    path: "portfolio/:id",
    component: PortfolioDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: "stock/:id",
    component: StockDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: "notes-demo",
    component: NotesDemoComponent,
  },
  {
    path: "stock-search-demo",
    component: StockSearchDemoComponent,
  },
  {
    path: "portfolio-refresh-demo",
    component: PortfolioTestDemoComponent,
  },
  { path: "**", redirectTo: "dashboard" },
];
