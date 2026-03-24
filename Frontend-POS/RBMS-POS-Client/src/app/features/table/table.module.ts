import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { TableRoutingModule } from './table-routing.module';
import { ZoneListComponent } from './pages/zone-list/zone-list.component';
import { TableListComponent } from './pages/table-list/table-list.component';
import { TableManageComponent } from './pages/table-manage/table-manage.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { FloorPlanComponent } from './pages/floor-plan/floor-plan.component';
import { ConfirmReservationDialogComponent } from './dialogs/confirm-reservation-dialog/confirm-reservation-dialog.component';
import { TableActionDialogComponent } from './dialogs/table-action-dialog/table-action-dialog.component';
import { OpenTableDialogComponent } from './dialogs/open-table-dialog/open-table-dialog.component';
import { MoveTableDialogComponent } from './dialogs/move-table-dialog/move-table-dialog.component';
import { LinkTableDialogComponent } from './dialogs/link-table-dialog/link-table-dialog.component';
import { FloorObjectDialogComponent } from './dialogs/floor-object-dialog/floor-object-dialog.component';
import { ZoneDialogComponent } from './dialogs/zone-dialog/zone-dialog.component';
import { QrCodeDialogComponent } from './dialogs/qr-code-dialog/qr-code-dialog.component';
import { ReservationDialogComponent } from './dialogs/reservation-dialog/reservation-dialog.component';

@NgModule({
  declarations: [
    ZoneListComponent,
    TableListComponent,
    TableManageComponent,
    ReservationListComponent,
    FloorPlanComponent,
    ConfirmReservationDialogComponent,
    TableActionDialogComponent,
    OpenTableDialogComponent,
    MoveTableDialogComponent,
    LinkTableDialogComponent,
    FloorObjectDialogComponent,
    ZoneDialogComponent,
    QrCodeDialogComponent,
    ReservationDialogComponent,
  ],
  imports: [TableRoutingModule, SharedModule],
})
export class TableModule {}
