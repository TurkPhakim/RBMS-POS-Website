import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { AdminRoutingModule } from './admin-routing.module';
import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ServiceChargeManageComponent } from './pages/service-charge-manage/service-charge-manage.component';
import { ShopSettingsComponent } from './pages/shop-settings/shop-settings.component';

@NgModule({
  declarations: [
    ServiceChargeListComponent,
    ServiceChargeManageComponent,
    PositionListComponent,
    PositionManageComponent,
    ShopSettingsComponent,
  ],
  imports: [
    AdminRoutingModule,
    SharedModule,
  ],
})
export class AdminModule {}
