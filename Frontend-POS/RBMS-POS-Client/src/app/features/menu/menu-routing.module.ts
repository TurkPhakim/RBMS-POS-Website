import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';

const routes: Routes = [
  { path: '', redirectTo: 'items', pathMatch: 'full' },
  {
    path: 'items',
    data: { breadcrumb: 'เมนู' },
    children: [
      { path: '', component: MenuListComponent },
      { path: 'create', component: MenuManageComponent, data: { breadcrumb: 'เพิ่ม' } },
      { path: 'update/:menuId', component: MenuManageComponent, data: { breadcrumb: 'แก้ไข' } },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule {}
