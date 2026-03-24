import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BillWaitingComponent } from './pages/bill-waiting/bill-waiting.component';
import { BillSummaryComponent } from './pages/bill-summary/bill-summary.component';
import { SlipUploadComponent } from './pages/slip-upload/slip-upload.component';
import { PaymentCompleteComponent } from './pages/payment-complete/payment-complete.component';
const routes: Routes = [
  { path: 'waiting', component: BillWaitingComponent },
  { path: 'summary', component: BillSummaryComponent },
  { path: 'upload', component: SlipUploadComponent },
  { path: 'complete', component: PaymentCompleteComponent },
  { path: '', redirectTo: 'waiting', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    BillWaitingComponent,
    BillSummaryComponent,
    SlipUploadComponent,
    PaymentCompleteComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class BillModule {}
