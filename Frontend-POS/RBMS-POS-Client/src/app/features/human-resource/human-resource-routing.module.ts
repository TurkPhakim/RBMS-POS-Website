import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    data: { breadcrumb: 'พนักงาน' },
    children: [
      {
        path: '',
        component: EmployeeListComponent,
      },
      {
        path: 'add',
        component: EmployeeManageComponent,
        data: { breadcrumb: 'เพิ่ม' },
      },
      {
        path: 'edit/:employeeId',
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
