import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerBillComponent } from './pages/customer-bill/customer-bill.component';

const routes: Routes = [
  { path: ':qrToken', component: CustomerBillComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
