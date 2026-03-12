import { NgModule } from '@angular/core';
import { TableRoutingModule } from './table-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { TableComponent } from './pages/table/table.component';

@NgModule({
  declarations: [TableComponent],
  imports: [TableRoutingModule, SharedModule],
})
export class TableModule {}
