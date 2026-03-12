// src/app/layouts/layout-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Guards
import { AuthGuard } from '../core/guards/auth.guard';
import { GuestGuard } from '../core/guards/guest.guard';
import { PermissionGuard } from '../core/guards/permission.guard';

// 3. Layouts
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

// 4. Shared pages
import { WelcomeComponent } from '../shared/pages/welcome/welcome.component';
import { AccessDeniedComponent } from '../shared/pages/access-denied/access-denied.component';

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
        data: { breadcrumb: 'Dashboard', permissions: ['dashboard.view.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'admin-setting',
        data: { breadcrumb: 'Admin-Setting' },
        loadChildren: () =>
          import('../features/admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'hr',
        data: { breadcrumb: 'Human-Resource', permissions: ['employee.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/human-resource/human-resource.module').then(
            (m) => m.HumanResourceModule
          ),
      },
      {
        path: 'menu',
        data: { breadcrumb: 'Menu', permissions: ['menu-item.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/menu/menu.module').then((m) => m.MenuModule),
      },
      {
        path: 'order',
        data: { breadcrumb: 'Order', permissions: ['order-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/order/order.module').then((m) => m.OrderModule),
      },
      {
        path: 'table',
        data: { breadcrumb: 'Table', permissions: ['table-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/table/table.module').then((m) => m.TableModule),
      },
      {
        path: 'payment',
        data: { breadcrumb: 'Payment', permissions: ['payment-manage.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/payment/payment.module').then(
            (m) => m.PaymentModule
          ),
      },
      {
        path: 'kitchen-display',
        data: { breadcrumb: 'Kitchen-Display', permissions: ['kitchen-order.read'] },
        canActivate: [PermissionGuard],
        loadChildren: () =>
          import('../features/kitchen-display/kitchen-display.module').then(
            (m) => m.KitchenDisplayModule
          ),
      },
      {
        path: 'profile',
        data: { breadcrumb: 'Profile' },
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
