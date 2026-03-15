import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/guards/auth.guard';
import { GuestGuard } from '../core/guards/guest.guard';
import { PermissionGuard } from '../core/guards/permission.guard';
import { AccessDeniedComponent } from '../shared/pages/access-denied/access-denied.component';
import { WelcomeComponent } from '../shared/pages/welcome/welcome.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';

const routes: Routes = [
  // Auth routes — AuthLayoutComponent + GuestGuard
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('../features/auths/auths.module').then((m) => m.AuthsModule),
  },

  // Main application routes — MainLayoutComponent + AuthGuard
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: WelcomeComponent,
      },
      {
        path: 'dashboard',
        data: { breadcrumb: 'แดชบอร์ด', permissions: ['dashboard.view.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'admin-setting',
        data: { breadcrumb: 'ตั้งค่าระบบ' },
        loadChildren: () =>
          import('../features/admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'human-resource',
        data: { breadcrumb: 'ทรัพยากรบุคคล', permissions: ['employee.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/human-resource/human-resource.module').then(
            (m) => m.HumanResourceModule
          ),
      },
      {
        path: 'menu',
        data: { breadcrumb: 'เมนูอาหาร', permissions: ['menu-item.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/menu/menu.module').then((m) => m.MenuModule),
      },
      {
        path: 'order',
        data: { breadcrumb: 'รายการสั่ง', permissions: ['order-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/order/order.module').then((m) => m.OrderModule),
      },
      {
        path: 'table',
        data: { breadcrumb: 'จัดการโต๊ะ', permissions: ['table-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/table/table.module').then((m) => m.TableModule),
      },
      {
        path: 'payment',
        data: { breadcrumb: 'ชำระเงิน', permissions: ['payment-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/payment/payment.module').then(
            (m) => m.PaymentModule
          ),
      },
      {
        path: 'kitchen-display',
        data: { breadcrumb: 'ครัว', permissions: ['kitchen-order.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/kitchen-display/kitchen-display.module').then(
            (m) => m.KitchenDisplayModule
          ),
      },
      {
        path: 'profile',
        data: { breadcrumb: 'โปรไฟล์' },
        loadChildren: () =>
          import('../features/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
    ],
  },

  // Access denied — no layout
  { path: 'access-denied', component: AccessDeniedComponent },

  // Catch all - redirect to login
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
