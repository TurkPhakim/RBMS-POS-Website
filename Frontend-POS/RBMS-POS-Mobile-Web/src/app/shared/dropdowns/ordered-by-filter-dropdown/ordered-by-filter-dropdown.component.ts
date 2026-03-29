import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-ordered-by-filter-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrderedByFilterDropdownComponent),
      multi: true,
    },
  ],
})
export class OrderedByFilterDropdownComponent extends DropdownBaseComponent implements OnChanges {
  @Input() names: string[] = [];

  constructor() {
    super();
    this.placeholder = 'ทุกคน';
    this.showClear = true;
    this.filter = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['names']) {
      this.options = this.names.map(n => ({ label: n, value: n }));
    }
  }
}
