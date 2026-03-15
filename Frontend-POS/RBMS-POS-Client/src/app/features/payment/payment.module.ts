import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentRoutingModule } from './payment-routing.module';

@NgModule({
  declarations: [PaymentComponent],
  imports: [PaymentRoutingModule, SharedModule],
})
export class PaymentModule {}
