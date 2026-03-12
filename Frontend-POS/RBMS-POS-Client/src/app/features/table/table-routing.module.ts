// src/app/features/table/table-routing.module.ts

// 1. Angular core
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// 2. Components
import { TableComponent } from './pages/table/table.component';

const routes: Routes = [
  {
    path: '',
    component: TableComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRoutingModule {}
