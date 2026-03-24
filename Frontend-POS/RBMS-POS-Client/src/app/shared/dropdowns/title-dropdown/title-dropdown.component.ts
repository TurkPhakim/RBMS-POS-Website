import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-title-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
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
