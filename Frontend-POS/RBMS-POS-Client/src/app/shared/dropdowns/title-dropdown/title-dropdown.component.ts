import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-title-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TitleDropdownComponent),
      multi: true,
    },
  ],
})
export class TitleDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'คำนำหน้า';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'นาย' },
      { value: 2, label: 'นาง' },
      { value: 3, label: 'นางสาว' },
    ];
  }
}
