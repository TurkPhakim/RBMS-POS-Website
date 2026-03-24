import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '@app/core/guards/permission.guard';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { OrderListComponent } from './pages/order-list/order-list.component';
import { StaffOrderComponent } from './pages/staff-order/staff-order.component';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'รายการออเดอร์' },
    children: [
      {
        path: '',
        component: OrderListComponent,
        data: { permissions: ['order-manage.read'] },
        canActivate: [PermissionGuard],
      },
      {
        path: ':orderId/add-items',
        component: StaffOrderComponent,
        data: { breadcrumb: 'สั่งอาหาร', permissions: ['order-manage.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: ':orderId',
        component: OrderDetailComponent,
        data: { breadcrumb: 'รายละเอียดออเดอร์', permissions: ['order-manage.read'] },
        canActivate: [PermissionGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
