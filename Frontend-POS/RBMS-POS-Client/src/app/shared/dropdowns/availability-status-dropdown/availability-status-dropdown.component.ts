import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-availability-status-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvailabilityStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class AvailabilityStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะการขาย';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: true, label: 'เปิดขาย' },
      { value: false, label: 'ปิดขาย' },
    ];
  }
}
