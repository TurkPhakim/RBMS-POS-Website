import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { OrderListComponent } from './pages/order-list/order-list.component';
import { OrderRoutingModule } from './order-routing.module';

@NgModule({
  declarations: [OrderListComponent],
  imports: [OrderRoutingModule, SharedModule],
})
export class OrderModule {}
