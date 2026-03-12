// src/app/features/payment/payment-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Components
import { PaymentComponent } from './pages/payment/payment.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
