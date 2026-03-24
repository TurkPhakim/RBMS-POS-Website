import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DropdownBaseComponent } from '../dropdown-base/dropdown-base.component';

@Component({
  selector: 'app-notification-table-dropdown',
  standalone: false,
  templateUrl: '../dropdown-base/dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NotificationTableDropdownComponent),
      multi: true,
    },
  ],
})
export class NotificationTableDropdownComponent extends DropdownBaseComponent {
  @Input() set tables(
    value: { id: number; name: string; zoneName?: string | null }[],
  ) {
    this.options = (value ?? []).map((t) => ({
      value: t.id,
      label: t.zoneName
        ? `โซน${t.zoneName} - โต๊ะ${t.name}`
        : `โต๊ะ${t.name}`,
    }));
  }

  constructor() {
    super();
    this.placeholder = 'กรองตามโซน/โต๊ะ';
    this.showClear = true;
    this.filter = true;
  }
}
