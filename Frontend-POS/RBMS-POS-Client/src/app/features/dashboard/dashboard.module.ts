// src/app/features/dashboard/dashboard.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Routing
import { DashboardRoutingModule } from './dashboard-routing.module';

// 3. Shared
import { SharedModule } from '@app/shared/shared.module';

// 4. Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, DashboardRoutingModule, SharedModule],
})
export class DashboardModule {}
