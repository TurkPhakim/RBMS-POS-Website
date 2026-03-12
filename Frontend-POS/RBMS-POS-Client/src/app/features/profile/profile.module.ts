import { NgModule } from '@angular/core';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { ProfileComponent } from './pages/profile/profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [ProfileRoutingModule, SharedModule],
})
export class ProfileModule {}
