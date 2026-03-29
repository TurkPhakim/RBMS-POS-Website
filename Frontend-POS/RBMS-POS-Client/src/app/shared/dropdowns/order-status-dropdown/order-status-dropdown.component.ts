import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-order-status-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrderStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class OrderStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะออเดอร์';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'Open', label: 'เปิด' },
      { value: 'Billing', label: 'รอชำระ' },
      { value: 'Completed', label: 'เสร็จสิ้น' },
    ];
  }
}
