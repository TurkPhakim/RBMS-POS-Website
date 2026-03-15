import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';
import { MenuRoutingModule } from './menu-routing.module';

@NgModule({
  declarations: [
    MenuListComponent,
    MenuManageComponent,
  ],
  imports: [
    MenuRoutingModule,
    SharedModule,
  ],
})
export class MenuModule {}
