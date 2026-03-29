import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-source-table-filter-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SourceTableFilterDropdownComponent),
      multi: true,
    },
  ],
})
export class SourceTableFilterDropdownComponent extends DropdownBaseComponent implements OnChanges {
  @Input() tableNames: string[] = [];

  constructor() {
    super();
    this.placeholder = 'ทุกโต๊ะ';
    this.showClear = true;
    this.filter = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableNames']) {
      this.options = this.tableNames.map(n => ({ label: `โต๊ะ${n}`, value: n }));
    }
  }
}
