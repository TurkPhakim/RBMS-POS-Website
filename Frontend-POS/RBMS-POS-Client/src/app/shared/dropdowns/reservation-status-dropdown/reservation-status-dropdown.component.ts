import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-reservation-status-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReservationStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class ReservationStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะการจอง';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'Pending', label: 'รอยืนยัน' },
      { value: 'Confirmed', label: 'ยืนยันแล้ว' },
      { value: 'CheckedIn', label: 'เข้าร้านแล้ว' },
      { value: 'Cancelled', label: 'ยกเลิก' },
      { value: 'NoShow', label: 'ไม่มา' },
    ];
  }
}
