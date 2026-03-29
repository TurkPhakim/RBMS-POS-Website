import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-shift-period-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ShiftPeriodDropdownComponent),
      multi: true,
    },
  ],
})
export class ShiftPeriodDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'ช่วงเวลา';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 1, label: 'ช่วงที่ 1' },
      { value: 2, label: 'ช่วงที่ 2' },
    ];
  }
}
