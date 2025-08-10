import { Routes } from '@angular/router';
import { PortfolioListComponent } from './pages/portfolio-list.component';
import { PortfolioDetailComponent } from './pages/portfolio-detail.component';
import { StockDetailComponent } from './pages/stock-detail.component';

export const routes: Routes = [
  { path: '', component: PortfolioListComponent },
  { path: 'portfolio/:id', component: PortfolioDetailComponent },
  { path: 'stock/:id', component: StockDetailComponent },
  { path: '**', redirectTo: '' }
];
