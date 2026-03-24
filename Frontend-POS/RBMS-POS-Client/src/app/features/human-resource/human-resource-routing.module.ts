import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeManageComponent } from './pages/employee-manage/employee-manage.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full',
  },
  {
    path: 'employees',
    data: { breadcrumb: 'รายการพนักงาน' },
    children: [
      {
        path: '',
        component: EmployeeListComponent,
      },
      {
        path: 'create',
        component: EmployeeManageComponent,
        canActivate: [PermissionGuard],
        data: { breadcrumb: 'เพิ่ม', permissions: ['employee.create'] },
      },
      {
        path: 'update/:employeeId',
        component: EmployeeManageComponent,
        data: { breadcrumb: 'แก้ไข' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HumanResourceRoutingModule {}
