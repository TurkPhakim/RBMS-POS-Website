import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-period-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PeriodDropdownComponent),
      multi: true,
    },
  ],
})
export class PeriodDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'ช่วงเวลาขาย';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'period1', label: 'ช่วงที่ 1' },
      { value: 'period2', label: 'ช่วงที่ 2' },
      { value: 'both', label: 'ทั้งวัน' },
    ];
  }
}
