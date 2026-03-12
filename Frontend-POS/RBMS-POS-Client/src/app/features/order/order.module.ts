import { NgModule } from '@angular/core';
import { OrderRoutingModule } from './order-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { OrderListComponent } from './pages/order-list/order-list.component';

@NgModule({
  declarations: [OrderListComponent],
  imports: [OrderRoutingModule, SharedModule],
})
export class OrderModule {}
