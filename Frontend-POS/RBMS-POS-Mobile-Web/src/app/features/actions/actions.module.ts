import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { ActionsComponent } from './pages/actions/actions.component';

const routes: Routes = [
  { path: '', component: ActionsComponent },
];

@NgModule({
  declarations: [ActionsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ActionsModule {}
