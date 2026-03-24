import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';

const routes: Routes = [
  { path: '', component: OrderTrackingComponent },
];

@NgModule({
  declarations: [OrderTrackingComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class OrdersModule {}
