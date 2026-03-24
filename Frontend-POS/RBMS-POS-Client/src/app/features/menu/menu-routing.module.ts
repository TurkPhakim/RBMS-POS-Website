import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { SubCategoryListComponent } from './pages/sub-category-list/sub-category-list.component';
import { SubCategoryManageComponent } from './pages/sub-category-manage/sub-category-manage.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';
import { OptionGroupListComponent } from './pages/option-group-list/option-group-list.component';
import { OptionGroupManageComponent } from './pages/option-group-manage/option-group-manage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full',
  },
  {
    path: 'categories',
    data: { breadcrumb: 'หมวดหมู่เมนู', permissions: ['menu-category.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: SubCategoryListComponent },
      {
        path: 'create',
        component: SubCategoryManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['menu-category.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:subCategoryId',
        component: SubCategoryManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'food',
    data: {
      breadcrumb: 'เมนูอาหาร',
      permissions: ['menu-food.read'],
      categoryType: 1,
    },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: MenuListComponent },
      {
        path: 'create',
        component: MenuManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['menu-food.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:menuId',
        component: MenuManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'beverage',
    data: {
      breadcrumb: 'เมนูเครื่องดื่ม',
      permissions: ['menu-beverage.read'],
      categoryType: 2,
    },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: MenuListComponent },
      {
        path: 'create',
        component: MenuManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['menu-beverage.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:menuId',
        component: MenuManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'dessert',
    data: {
      breadcrumb: 'เมนูของหวาน',
      permissions: ['menu-dessert.read'],
      categoryType: 3,
    },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: MenuListComponent },
      {
        path: 'create',
        component: MenuManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['menu-dessert.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:menuId',
        component: MenuManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
  {
    path: 'options',
    data: { breadcrumb: 'ตัวเลือกเสริม', permissions: ['menu-option.read'] },
    canActivate: [PermissionGuard],
    children: [
      { path: '', component: OptionGroupListComponent },
      {
        path: 'create',
        component: OptionGroupManageComponent,
        data: { breadcrumb: 'เพิ่ม', permissions: ['menu-option.create'] },
        canActivate: [PermissionGuard],
      },
      {
        path: 'update/:optionGroupId',
        component: OptionGroupManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
