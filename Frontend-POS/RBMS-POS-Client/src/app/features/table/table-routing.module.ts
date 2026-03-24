import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { ZoneListComponent } from './pages/zone-list/zone-list.component';
import { TableListComponent } from './pages/table-list/table-list.component';
import { TableManageComponent } from './pages/table-manage/table-manage.component';
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
    data: { breadcrumb: 'ผังโต๊ะ', permissions: ['floor-plan.read'] },
    canActivate: [PermissionGuard],
  },
  {
    path: 'zones',
    data: { breadcrumb: 'จัดการโซน / โต๊ะ', permissions: ['table-manage.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: ZoneListComponent },
    ],
  },
  {
    path: 'tables',
    data: { breadcrumb: 'โต๊ะ', permissions: ['table-manage.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', redirectTo: '/table/zones', pathMatch: 'full' },
      {
        path: 'create',
        component: TableManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['table-manage.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:tableId',
        component: TableManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
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
