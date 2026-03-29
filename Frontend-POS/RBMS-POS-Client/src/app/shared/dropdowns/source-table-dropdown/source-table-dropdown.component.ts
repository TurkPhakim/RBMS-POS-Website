import { Component, forwardRef, Input, OnChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-source-table-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SourceTableDropdownComponent),
      multi: true,
    },
  ],
})
export class SourceTableDropdownComponent
  extends DropdownBaseComponent
  implements OnChanges
{
  @Input() tableNames: string[] = [];

  constructor() {
    super();
    this.placeholder = 'โต๊ะต้นทาง';
    this.showClear = true;
    this.filter = false;
  }

  ngOnChanges(): void {
    this.options = this.tableNames.map((name) => ({
      value: name,
      label: `โต๊ะ${name}`,
    }));
  }
}
