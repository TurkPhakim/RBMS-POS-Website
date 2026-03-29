import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-table-size-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableSizeDropdownComponent),
      multi: true,
    },
  ],
})
export class TableSizeDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'ขนาดโต๊ะ';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 'Small', label: 'เล็ก' },
      { value: 'Medium', label: 'กลาง' },
      { value: 'Large', label: 'ใหญ่' },
    ];
  }
}
