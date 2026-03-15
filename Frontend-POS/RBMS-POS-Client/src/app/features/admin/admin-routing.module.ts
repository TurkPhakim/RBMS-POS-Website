import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '@app/core/guards/permission.guard';

import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ServiceChargeManageComponent } from './pages/service-charge-manage/service-charge-manage.component';
import { ShopSettingsComponent } from './pages/shop-settings/shop-settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'service-charges',
    pathMatch: 'full',
  },
  {
    path: 'service-charges',
    data: { breadcrumb: 'ค่าบริการ', permissions: ['service-charge.read'] },
    canActivate: [PermissionGuard],
    children: [
      {
        path: '',
        component: ServiceChargeListComponent,
      },
      {
        path: 'create',
        component: ServiceChargeManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['service-charge.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:serviceChargeId',
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
        path: 'create',
        component: PositionManageComponent,
        data: { breadcrumb: 'เพิ่ม' },
      },
      {
        path: 'update/:positionId',
        component: PositionManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'shop-settings',
    component: ShopSettingsComponent,
    data: { breadcrumb: 'ตั้งค่าร้านค้า', permissions: ['shop-settings.read'] },
    canActivate: [PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
