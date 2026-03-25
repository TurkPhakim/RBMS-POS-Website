import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { PaymentComponent } from './pages/payment/payment.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SessionHistoryComponent } from './pages/session-history/session-history.component';
import { OpenSessionDialogComponent } from './dialogs/open-session-dialog/open-session-dialog.component';
import { CloseSessionDialogComponent } from './dialogs/close-session-dialog/close-session-dialog.component';
import { CashDrawerDialogComponent } from './dialogs/cash-drawer-dialog/cash-drawer-dialog.component';
import { CashPaymentDialogComponent } from './dialogs/cash-payment-dialog/cash-payment-dialog.component';
import { QrPaymentDialogComponent } from './dialogs/qr-payment-dialog/qr-payment-dialog.component';
import { PaymentHistoryComponent } from './pages/payment-history/payment-history.component';
import { SessionDetailComponent } from './pages/session-detail/session-detail.component';
import { PaymentRoutingModule } from './payment-routing.module';

@NgModule({
  declarations: [
    PaymentComponent,
    CheckoutComponent,
    SessionHistoryComponent,
    PaymentHistoryComponent,
    SessionDetailComponent,
    OpenSessionDialogComponent,
    CloseSessionDialogComponent,
    CashDrawerDialogComponent,
    CashPaymentDialogComponent,
    QrPaymentDialogComponent,
  ],
  imports: [PaymentRoutingModule, SharedModule],
})
export class PaymentModule {}
