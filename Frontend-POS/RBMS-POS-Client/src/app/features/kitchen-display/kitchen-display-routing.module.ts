// src/app/features/kitchen-display/kitchen-display-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Components
import { KitchenDisplayComponent } from './pages/kitchen-display/kitchen-display.component';

const routes: Routes = [
  {
    path: '',
    component: KitchenDisplayComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KitchenDisplayRoutingModule {}
