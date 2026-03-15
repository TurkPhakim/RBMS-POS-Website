import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-address-type-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressTypeDropdownComponent),
      multi: true,
    },
  ],
})
export class AddressTypeDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'ประเภทที่อยู่';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'ที่อยู่ตามทะเบียนบ้าน' },
      { value: 2, label: 'ที่อยู่ปัจจุบัน' },
      { value: 3, label: 'ที่อยู่ที่ทำงาน' },
    ];
  }
}
