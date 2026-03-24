import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { CancelReasonDialogComponent } from './dialogs/cancel-reason-dialog/cancel-reason-dialog.component';
import { MenuItemDialogComponent } from './dialogs/menu-item-dialog/menu-item-dialog.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { StaffOrderComponent } from './pages/staff-order/staff-order.component';
import { OrderRoutingModule } from './order-routing.module';

@NgModule({
  declarations: [
    CancelReasonDialogComponent,
    MenuItemDialogComponent,
    OrderDetailComponent,
    OrderListComponent,
    StaffOrderComponent,
  ],
  imports: [OrderRoutingModule, SharedModule],
})
export class OrderModule {}
