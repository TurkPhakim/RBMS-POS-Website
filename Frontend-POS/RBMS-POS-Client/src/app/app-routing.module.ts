import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestDialogPageComponent } from './test-dialog-page/test-dialog-page.component';
import { TestKitchenDisplayComponent } from './test-kitchen-display/test-kitchen-display.component';
const routes: Routes = [
  // Test pages — root-level, no guard
  { path: 'test-dialog-page', component: TestDialogPageComponent },
  { path: 'test-kitchen-display', component: TestKitchenDisplayComponent },

  // All routes go through layouts module (centralized routing)
  {
    path: '',
    loadChildren: () =>
      import('./layouts/layouts.module').then((m) => m.LayoutsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
