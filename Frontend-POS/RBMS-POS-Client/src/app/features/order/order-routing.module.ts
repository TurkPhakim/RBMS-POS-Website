// src/app/features/order/order-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Components
import { OrderListComponent } from './pages/order-list/order-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
