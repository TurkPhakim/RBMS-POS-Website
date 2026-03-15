import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { TableComponent } from './pages/table/table.component';
import { TableRoutingModule } from './table-routing.module';

@NgModule({
  declarations: [TableComponent],
  imports: [TableRoutingModule, SharedModule],
})
export class TableModule {}
