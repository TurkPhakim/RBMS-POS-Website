import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { MenuBrowseComponent } from './pages/menu-browse/menu-browse.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { MenuDetailComponent } from './pages/menu-detail/menu-detail.component';

const routes: Routes = [
  { path: '', component: MenuBrowseComponent },
  { path: ':menuId', component: MenuDetailComponent },
];

@NgModule({
  declarations: [MenuBrowseComponent, MenuCardComponent, MenuDetailComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class MenuModule {}
