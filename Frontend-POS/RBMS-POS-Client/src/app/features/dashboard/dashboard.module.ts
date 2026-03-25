import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';

import { SharedModule } from '@app/shared/shared.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { SalesReportComponent } from './pages/sales-report/sales-report.component';

@NgModule({
  declarations: [DashboardOverviewComponent, SalesReportComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    BaseChartDirective,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DashboardModule {}
