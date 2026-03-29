import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-dropdown-base',
  standalone: false,
  templateUrl: './dropdown-base.component.html',
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownBaseComponent),
      multi: true,
    },
  ],
})
export class DropdownBaseComponent implements OnDestroy, ControlValueAccessor {
  @Input() placeholder = '';
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() showClear = true;
  @Input() filter = false;
  @Input() filterBy: string | undefined;
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() styleClass = 'w-full';
  @Input() options: any[] = [];

  selectedValue: any = null;
  isDisabled = false;

  protected readonly destroy$ = new Subject<void>();

  private onChangeFn: (value: any) => void = () => {};
  private onTouchedFn: () => void = () => {};

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onValueChange(value: any): void {
    this.selectedValue = value;
    this.onChangeFn(value);
    this.onTouchedFn();
  }
}
