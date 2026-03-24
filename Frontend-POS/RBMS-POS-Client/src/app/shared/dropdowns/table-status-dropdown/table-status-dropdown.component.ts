import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-table-status-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
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
      { value: 'Billing', label: 'เช็คบิล' },
      { value: 'Reserved', label: 'จองแล้ว' },
      { value: 'Cleaning', label: 'ทำความสะอาด' },
      { value: 'Unavailable', label: 'ปิดใช้งาน' },
    ];
  }
}
