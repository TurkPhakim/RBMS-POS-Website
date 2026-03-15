import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-active-status-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ActiveStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class ActiveStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะ';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ];
  }
}
