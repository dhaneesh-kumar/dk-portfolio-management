import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PortfolioListComponent } from './components/portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './components/portfolio-detail/portfolio-detail.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PortfolioListComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'My Portfolios',
      breadcrumb: 'Portfolios'
    }
  },
  {
    path: ':id',
    component: PortfolioDetailComponent,
    canActivate: [AuthGuard],
    data: { 
      title: 'Portfolio Details',
      breadcrumb: 'Portfolio'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortfolioRoutingModule { }
