import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { MenuBrowseComponent } from './pages/menu-browse/menu-browse.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { MenuDetailSheetComponent } from './dialogs/menu-detail-sheet/menu-detail-sheet.component';

const routes: Routes = [
  { path: '', component: MenuBrowseComponent },
];

@NgModule({
  declarations: [MenuBrowseComponent, MenuCardComponent, MenuDetailSheetComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class MenuModule {}
