import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ServiceChargeManageComponent } from './pages/service-charge-manage/service-charge-manage.component';
import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'service-charges',
    pathMatch: 'full',
  },
  {
    path: 'service-charges',
    data: { breadcrumb: 'Service Charges', permissions: ['service-charge.read'] },
    canActivate: [PermissionGuard],
    children: [
      {
        path: '',
        component: ServiceChargeListComponent,
      },
      {
        path: 'add',
        component: ServiceChargeManageComponent,
        data: { breadcrumb: 'เพิ่ม' },
      },
      {
        path: 'edit/:serviceChargeId',
        component: ServiceChargeManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'positions',
    data: { breadcrumb: 'จัดการตำแหน่ง', permissions: ['position.read'] },
    canActivate: [PermissionGuard],
    children: [
      {
        path: '',
        component: PositionListComponent,
      },
      {
        path: 'add',
        component: PositionManageComponent,
        data: { breadcrumb: 'เพิ่ม' },
      },
      {
        path: 'edit/:positionId',
        component: PositionManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
