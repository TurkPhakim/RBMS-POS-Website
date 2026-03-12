import { NgModule } from '@angular/core';
import { KitchenDisplayRoutingModule } from './kitchen-display-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { KitchenDisplayComponent } from './pages/kitchen-display/kitchen-display.component';

@NgModule({
  declarations: [KitchenDisplayComponent],
  imports: [KitchenDisplayRoutingModule, SharedModule],
})
export class KitchenDisplayModule {}
