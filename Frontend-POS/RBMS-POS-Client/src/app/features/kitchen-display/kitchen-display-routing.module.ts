import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionGuard } from '@app/core/guards/permission.guard';
import { KitchenDisplayComponent } from './pages/kitchen-display/kitchen-display.component';

const routes: Routes = [
  { path: '', redirectTo: 'food', pathMatch: 'full' },
  {
    path: 'food',
    component: KitchenDisplayComponent,
    data: { breadcrumb: 'ครัวอาหาร', pageTitle: 'ครัวอาหาร', pageIcon: 'cook-chef', categoryType: 1, permissions: ['kitchen-food.read'], updatePermission: 'kitchen-food.update' },
    canActivate: [PermissionGuard],
  },
  {
    path: 'beverage',
    component: KitchenDisplayComponent,
    data: { breadcrumb: 'บาร์เครื่องดื่ม', pageTitle: 'บาร์เครื่องดื่ม', pageIcon: 'bartender', categoryType: 2, permissions: ['kitchen-beverage.read'], updatePermission: 'kitchen-beverage.update' },
    canActivate: [PermissionGuard],
  },
  {
    path: 'dessert',
    component: KitchenDisplayComponent,
    data: { breadcrumb: 'ครัวขนมหวาน', pageTitle: 'ครัวขนมหวาน', pageIcon: 'pastry-chef', categoryType: 3, permissions: ['kitchen-dessert.read'], updatePermission: 'kitchen-dessert.update' },
    canActivate: [PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KitchenDisplayRoutingModule {}
