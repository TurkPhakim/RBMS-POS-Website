import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-religion-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReligionDropdownComponent),
      multi: true,
    },
  ],
})
export class ReligionDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'ศาสนา';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'พุทธ' },
      { value: 2, label: 'อิสลาม' },
      { value: 3, label: 'คริสต์' },
      { value: 4, label: 'ฮินดู' },
      { value: 5, label: 'ไม่นับถือศาสนา' },
      { value: 99, label: 'อื่นๆ' },
    ];
  }
}
