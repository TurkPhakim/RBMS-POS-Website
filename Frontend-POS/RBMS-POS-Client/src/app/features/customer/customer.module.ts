import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerBillComponent } from './pages/customer-bill/customer-bill.component';

@NgModule({
  declarations: [CustomerBillComponent],
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    CustomerRoutingModule,
  ],
})
export class CustomerModule {}
