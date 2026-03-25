import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardOverviewComponent } from './pages/dashboard-overview/dashboard-overview.component';
import { SalesReportComponent } from './pages/sales-report/sales-report.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardOverviewComponent,
    data: { breadcrumb: 'ภาพรวม' },
  },
  {
    path: 'sales',
    component: SalesReportComponent,
    data: { breadcrumb: 'รายงานยอดขาย' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
