// src/app/features/dashboard/dashboard-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
