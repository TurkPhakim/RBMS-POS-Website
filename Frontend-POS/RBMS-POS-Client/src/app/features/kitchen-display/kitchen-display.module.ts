import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { KitchenDisplayComponent } from './pages/kitchen-display/kitchen-display.component';
import { KitchenDisplayRoutingModule } from './kitchen-display-routing.module';

@NgModule({
  declarations: [KitchenDisplayComponent],
  imports: [KitchenDisplayRoutingModule, SharedModule],
})
export class KitchenDisplayModule {}
