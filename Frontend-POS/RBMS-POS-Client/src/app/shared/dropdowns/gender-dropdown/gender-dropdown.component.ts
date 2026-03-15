import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-gender-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GenderDropdownComponent),
      multi: true,
    },
  ],
})
export class GenderDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'เพศ';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'ชาย' },
      { value: 2, label: 'หญิง' },
      { value: 3, label: 'อื่นๆ' },
    ];
  }
}
