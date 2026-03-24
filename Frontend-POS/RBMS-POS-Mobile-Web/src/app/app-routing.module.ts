import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerAuthGuard } from '@core/guards/customer-auth.guard';
import { AuthComponent } from './pages/auth/auth.component';
import { ExpiredComponent } from './pages/expired/expired.component';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';
const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'expired', component: ExpiredComponent },
  {
    path: '',
    component: CustomerLayoutComponent,
    canActivate: [CustomerAuthGuard],
    children: [
      { path: 'menu', loadChildren: () => import('./features/menu/menu.module').then(m => m.MenuModule) },
      { path: 'cart', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },
      { path: 'orders', loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule) },
      { path: 'bill', loadChildren: () => import('./features/bill/bill.module').then(m => m.BillModule) },
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'expired' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
