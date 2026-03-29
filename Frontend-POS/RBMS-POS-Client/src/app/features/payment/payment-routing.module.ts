import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '@app/core/guards/permission.guard';
import { PaymentComponent } from './pages/payment/payment.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SessionHistoryComponent } from './pages/session-history/session-history.component';
import { PaymentHistoryComponent } from './pages/payment-history/payment-history.component';
import { SessionDetailComponent } from './pages/session-detail/session-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    data: { breadcrumb: 'รอบการขาย' },
  },
  {
    path: 'checkout/:orderId',
    component: CheckoutComponent,
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'ชำระบิลออเดอร์', permissions: ['payment-manage.create'] },
  },
  {
    path: 'session-history',
    data: { breadcrumb: 'ประวัติรอบขาย', permissions: ['cashier-session.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: SessionHistoryComponent },
      {
        path: ':cashierSessionId',
        component: SessionDetailComponent,
        data: { breadcrumb: 'รายละเอียดรอบขาย' },
      },
    ],
  },
  {
    path: 'payment-history',
    component: PaymentHistoryComponent,
    canActivate: [PermissionGuard],
    data: { breadcrumb: 'ประวัติชำระเงิน', permissions: ['payment-manage.read'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {}
