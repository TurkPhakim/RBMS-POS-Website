import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-user-status-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserStatusDropdownComponent),
      multi: true,
    },
  ],
})
export class UserStatusDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'สถานะบัญชีผู้ใช้งาน';
    this.showClear = true;
    this.filter = false;
    this.options = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'locked', label: 'Locked' },
    ];
  }
}
