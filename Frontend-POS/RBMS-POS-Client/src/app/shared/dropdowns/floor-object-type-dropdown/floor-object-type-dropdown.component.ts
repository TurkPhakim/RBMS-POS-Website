import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-floor-object-type-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloorObjectTypeDropdownComponent),
      multi: true,
    },
  ],
})
export class FloorObjectTypeDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'เลือกประเภท';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 'Restroom', label: 'ห้องน้ำ' },
      { value: 'Stairs', label: 'บันได' },
      { value: 'Counter', label: 'เคาน์เตอร์/บาร์' },
      { value: 'Kitchen', label: 'ครัว' },
      { value: 'Exit', label: 'ทางออก/ทางเข้า' },
      { value: 'Cashier', label: 'แคชเชียร์' },
      { value: 'Decoration', label: 'ตกแต่งอื่นๆ' },
    ];
  }
}
