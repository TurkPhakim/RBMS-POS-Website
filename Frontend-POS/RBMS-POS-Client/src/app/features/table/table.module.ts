import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { TableRoutingModule } from './table-routing.module';
import { ZoneTableListComponent } from './pages/zone-table-list/zone-table-list.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { FloorPlanComponent } from './pages/floor-plan/floor-plan.component';
import { ConfirmReservationDialogComponent } from './dialogs/confirm-reservation-dialog/confirm-reservation-dialog.component';
import { FloorObjectDialogComponent } from './dialogs/floor-object-dialog/floor-object-dialog.component';
import { ZoneDialogComponent } from './dialogs/zone-dialog/zone-dialog.component';
import { TableDialogComponent } from './dialogs/table-dialog/table-dialog.component';
import { ReservationDialogComponent } from './dialogs/reservation-dialog/reservation-dialog.component';

@NgModule({
  declarations: [
    ZoneTableListComponent,
    ReservationListComponent,
    FloorPlanComponent,
    ConfirmReservationDialogComponent,
    FloorObjectDialogComponent,
    ZoneDialogComponent,
    TableDialogComponent,
    ReservationDialogComponent,
  ],
  imports: [TableRoutingModule, SharedModule],
})
export class TableModule {}
