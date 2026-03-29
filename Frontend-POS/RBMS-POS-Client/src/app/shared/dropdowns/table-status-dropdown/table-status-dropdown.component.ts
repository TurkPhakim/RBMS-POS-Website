import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-table-status-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class TableStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะโต๊ะ';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'Available', label: 'ว่าง' },
      { value: 'Occupied', label: 'มีลูกค้า' },
      { value: 'Reserved', label: 'ติดจอง' },
      { value: 'Unavailable', label: 'ปิดใช้งาน' },
    ];
  }
}
