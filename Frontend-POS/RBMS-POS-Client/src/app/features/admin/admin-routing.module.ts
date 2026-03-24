import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ShopSettingsComponent } from './pages/shop-settings/shop-settings.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserManageComponent } from './pages/user-manage/user-manage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'service-charges',
    data: { breadcrumb: 'จัดการค่าบริการ', permissions: ['service-charge.read'] },
    canActivate: [PermissionGuard],
    component: ServiceChargeListComponent,
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
        data: { breadcrumb: 'เพิ่ม', permissions: ['position.create'] },
        canActivate: [PermissionGuard],
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
  {
    path: 'users',
    data: {
      breadcrumb: 'รายชื่อผู้ใช้งาน',
      permissions: ['user-management.read'],
    },
    canActivate: [PermissionGuard],
    children: [
      {
        path: '',
        component: UserListComponent,
      },
      {
        path: 'update/:userId',
        component: UserManageComponent,
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
