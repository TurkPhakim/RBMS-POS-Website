import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';
import { ServiceChargeDialogComponent } from './dialogs/service-charge-dialog/service-charge-dialog.component';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ShopSettingsComponent } from './pages/shop-settings/shop-settings.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserManageComponent } from './pages/user-manage/user-manage.component';

@NgModule({
  declarations: [
    ServiceChargeDialogComponent,
    ServiceChargeListComponent,
    PositionListComponent,
    PositionManageComponent,
    ShopSettingsComponent,
    UserListComponent,
    UserManageComponent,
  ],
  imports: [AdminRoutingModule, SharedModule],
})
export class AdminModule {}
