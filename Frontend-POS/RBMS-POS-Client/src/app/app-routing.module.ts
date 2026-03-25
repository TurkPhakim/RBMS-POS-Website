import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestDialogPageComponent } from './test-dialog-page/test-dialog-page.component';
import { TestDashboardOverviewComponent } from './test-dashboard-overview/test-dashboard-overview.component';
import { TestSalesReportComponent } from './test-sales-report/test-sales-report.component';

const routes: Routes = [
  // Test pages — root-level, no guard
  { path: 'test-dialog-page', component: TestDialogPageComponent },
  { path: 'test-dashboard-overview', component: TestDashboardOverviewComponent },
  { path: 'test-sales-report', component: TestSalesReportComponent },

  // All routes go through layouts module (centralized routing)
  {
    path: '',
    loadChildren: () =>
      import('./layouts/layouts.module').then((m) => m.LayoutsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
