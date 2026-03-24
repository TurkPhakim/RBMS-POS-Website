import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { PinCodeDialogComponent } from './dialogs/pin-code-dialog/pin-code-dialog.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  declarations: [ProfileComponent, PinCodeDialogComponent],
  imports: [ProfileRoutingModule, SharedModule],
})
export class ProfileModule {}
