import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-floor-object-type-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
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
    this.placeholder = 'ประเภทวัตถุ';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 'Restroom', label: 'ห้องน้ำ' },
      { value: 'Stairs', label: 'บันได' },
      { value: 'Counter', label: 'เคาน์เตอร์บาร์' },
      { value: 'Kitchen', label: 'ครัว' },
      { value: 'Exit', label: 'ทางเข้า/ทางออก' },
      { value: 'Cashier', label: 'แคชเชียร์' },
      { value: 'Plant', label: 'ต้นไม้/พุ่มไม้' },
      { value: 'Decoration', label: 'ของตกแต่งอื่นๆ' },
    ];
  }
}
