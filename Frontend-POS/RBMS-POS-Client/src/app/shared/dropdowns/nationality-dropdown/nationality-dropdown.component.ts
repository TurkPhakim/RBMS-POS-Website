import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-nationality-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NationalityDropdownComponent),
      multi: true,
    },
  ],
})
export class NationalityDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สัญชาติ';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'ไทย' },
      { value: 2, label: 'จีน' },
      { value: 3, label: 'ญี่ปุ่น' },
      { value: 4, label: 'เกาหลี' },
      { value: 5, label: 'เมียนมา' },
      { value: 6, label: 'ลาว' },
      { value: 7, label: 'เวียดนาม' },
      { value: 8, label: 'อินเดีย' },
      { value: 9, label: 'ชาติยุโรป' },
      { value: 99, label: 'อื่นๆ' },
    ];
  }
}
