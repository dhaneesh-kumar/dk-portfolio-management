import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { PortfolioRoutingModule } from './portfolio-routing.module';

// Components
import { PortfolioListComponent } from './components/portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './components/portfolio-detail/portfolio-detail.component';
import { PortfolioFormComponent } from './components/portfolio-form/portfolio-form.component';
import { PortfolioChartComponent } from './components/portfolio-chart/portfolio-chart.component';
import { SharePortfolioComponent } from './components/share-portfolio/share-portfolio.component';
import { PortfolioStatsComponent } from './components/portfolio-stats/portfolio-stats.component';

// Services
import { PortfolioService } from './services/portfolio.service';
import { PortfolioDataService } from './services/portfolio-data.service';
import { PortfolioCalculationService } from './services/portfolio-calculation.service';
import { PortfolioShareService } from './services/portfolio-share.service';

@NgModule({
  declarations: [
    PortfolioListComponent,
    PortfolioDetailComponent,
    PortfolioFormComponent,
    PortfolioChartComponent,
    SharePortfolioComponent,
    PortfolioStatsComponent,
  ],
  imports: [
    SharedModule,
    PortfolioRoutingModule,
  ],
  providers: [
    PortfolioService,
    PortfolioDataService,
    PortfolioCalculationService,
    PortfolioShareService,
  ]
})
export class PortfolioModule { }
