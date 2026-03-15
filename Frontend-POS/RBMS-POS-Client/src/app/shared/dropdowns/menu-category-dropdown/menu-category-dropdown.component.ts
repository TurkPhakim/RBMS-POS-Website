import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-menu-category-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MenuCategoryDropdownComponent),
      multi: true,
    },
  ],
})
export class MenuCategoryDropdownComponent extends DropdownBaseComponent {
  constructor() {
    super();
    this.placeholder = 'เลือกหมวดหมู่';
    this.showClear = false;
    this.filter = false;
    this.options = [
      { value: 1, label: 'อาหาร' },
      { value: 2, label: 'เครื่องดื่ม' },
    ];
  }
}
