import { Routes } from "@angular/router";
import { PortfolioListComponent } from "./pages/portfolio-list.component";
import { PortfolioDetailComponent } from "./pages/portfolio-detail.component";
import { StockDetailComponent } from "./pages/stock-detail.component";
import { LoginComponent } from "./components/login.component";
import { authGuard, guestGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "", component: PortfolioListComponent, canActivate: [authGuard] },
  { path: "portfolio/:id", component: PortfolioDetailComponent, canActivate: [authGuard] },
  { path: "stock/:id", component: StockDetailComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "" },
];
