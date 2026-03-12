import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { ServiceChargeListComponent } from './pages/service-charge-list/service-charge-list.component';
import { ServiceChargeManageComponent } from './pages/service-charge-manage/service-charge-manage.component';
import { PositionListComponent } from './pages/position-list/position-list.component';
import { PositionManageComponent } from './pages/position-manage/position-manage.component';

@NgModule({
  declarations: [
    ServiceChargeListComponent,
    ServiceChargeManageComponent,
    PositionListComponent,
    PositionManageComponent,
  ],
  imports: [
    AdminRoutingModule,
    SharedModule,
  ],
})
export class AdminModule {}
