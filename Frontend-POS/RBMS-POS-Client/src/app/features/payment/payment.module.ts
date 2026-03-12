import { NgModule } from '@angular/core';
import { PaymentRoutingModule } from './payment-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { PaymentComponent } from './pages/payment/payment.component';

@NgModule({
  declarations: [PaymentComponent],
  imports: [PaymentRoutingModule, SharedModule],
})
export class PaymentModule {}
