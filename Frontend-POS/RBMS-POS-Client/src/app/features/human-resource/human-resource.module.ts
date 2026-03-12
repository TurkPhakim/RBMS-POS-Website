import { NgModule } from '@angular/core';
import { HumanResourceRoutingModule } from './human-resource-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeManageComponent } from './pages/employee-manage/employee-manage.component';
import { CreateUserDialogComponent } from './dialogs/create-user-dialog/create-user-dialog.component';
import { CredentialsDialogComponent } from './dialogs/credentials-dialog/credentials-dialog.component';

@NgModule({
  declarations: [
    EmployeeListComponent,
    EmployeeManageComponent,
    CreateUserDialogComponent,
    CredentialsDialogComponent,
  ],
  imports: [HumanResourceRoutingModule, SharedModule],
})
export class HumanResourceModule {}
