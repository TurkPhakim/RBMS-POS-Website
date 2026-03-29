import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { CancelReasonDialogComponent } from './dialogs/cancel-reason-dialog/cancel-reason-dialog.component';
import { MenuItemDialogComponent } from './dialogs/menu-item-dialog/menu-item-dialog.component';
import { TableActionDialogComponent } from './dialogs/table-action-dialog/table-action-dialog.component';
import { OpenTableDialogComponent } from './dialogs/open-table-dialog/open-table-dialog.component';
import { MoveTableDialogComponent } from './dialogs/move-table-dialog/move-table-dialog.component';
import { LinkTableDialogComponent } from './dialogs/link-table-dialog/link-table-dialog.component';
import { QrCodeDialogComponent } from './dialogs/qr-code-dialog/qr-code-dialog.component';
import { EditGuestCountDialogComponent } from './dialogs/edit-guest-count-dialog/edit-guest-count-dialog.component';
import { OrderOverviewComponent } from './pages/order-overview/order-overview.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { StaffOrderComponent } from './pages/staff-order/staff-order.component';
import { OrderRoutingModule } from './order-routing.module';

@NgModule({
  declarations: [
    CancelReasonDialogComponent,
    MenuItemDialogComponent,
    TableActionDialogComponent,
    OpenTableDialogComponent,
    MoveTableDialogComponent,
    LinkTableDialogComponent,
    QrCodeDialogComponent,
    EditGuestCountDialogComponent,
    OrderOverviewComponent,
    OrderDetailComponent,
    OrderListComponent,
    StaffOrderComponent,
  ],
  imports: [OrderRoutingModule, SharedModule],
})
export class OrderModule {}
