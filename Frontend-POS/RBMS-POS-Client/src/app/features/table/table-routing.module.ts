import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { ZoneTableListComponent } from './pages/zone-table-list/zone-table-list.component';
import { ReservationListComponent } from './pages/reservation-list/reservation-list.component';
import { FloorPlanComponent } from './pages/floor-plan/floor-plan.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'floor-plan',
    pathMatch: 'full',
  },
  {
    path: 'floor-plan',
    component: FloorPlanComponent,
    data: { breadcrumb: 'จัดวางผังร้าน', permissions: ['floor-plan.read'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'zones',
    data: { breadcrumb: 'จัดการโซน / โต๊ะ', permissions: ['table-manage.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: ZoneTableListComponent },
    ],
  },
  {
    path: 'reservations',
    data: { breadcrumb: 'จัดการจองโต๊ะ', permissions: ['reservation.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: ReservationListComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRoutingModule {}
