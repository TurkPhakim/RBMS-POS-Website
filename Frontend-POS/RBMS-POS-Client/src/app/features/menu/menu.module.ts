import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { MenuRoutingModule } from './menu-routing.module';
import { SubCategoryListComponent } from './pages/sub-category-list/sub-category-list.component';
import { SubCategoryManageComponent } from './pages/sub-category-manage/sub-category-manage.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { MenuManageComponent } from './pages/menu-manage/menu-manage.component';
import { OptionGroupListComponent } from './pages/option-group-list/option-group-list.component';
import { OptionGroupManageComponent } from './pages/option-group-manage/option-group-manage.component';
import { SelectOptionGroupDialogComponent } from './dialogs/select-option-group-dialog/select-option-group-dialog.component';

@NgModule({
  declarations: [
    SubCategoryListComponent,
    SubCategoryManageComponent,
    MenuListComponent,
    MenuManageComponent,
    OptionGroupListComponent,
    OptionGroupManageComponent,
    SelectOptionGroupDialogComponent,
  ],
  imports: [MenuRoutingModule, SharedModule],
})
export class MenuModule {}
