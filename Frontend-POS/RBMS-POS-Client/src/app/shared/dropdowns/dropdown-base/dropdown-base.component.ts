import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { finalize, Observable, Subject, take, takeUntil } from 'rxjs';

import { ScrollerOptions } from 'primeng/api';

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
export class DropdownBaseComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  // === Configurable Inputs ===
  @Input() placeholder = '';
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() showClear = true;
  @Input() filter = true;
  @Input() filterBy: string | undefined;
  @Input() disabled = false;
  @Input() invalid = false;
  @Input() styleClass = 'w-full';

  // === Lazy Load Inputs ===
  @Input() fetchFn?: (
    page: number,
    pageSize: number,
    filter?: any,
  ) => Observable<{ results: any[]; total: number }>;
  @Input() pageSize = 20;
  @Input() defaultFilter: any = {};

  // === Options (child set ค่าใน constructor หรือ ngOnInit) ===
  options: any[] = [];

  // === Internal State ===
  selectedValue: any = null;
  isDisabled = false;
  isLoading = false;

  // === Lazy Load State ===
  lazyOptions: any[] = [];
  total = 0;
  currentPage = 1;
  filterValue: any = {};
  virtualScroll = false;
  virtualScrollItemSize = 38;
  virtualScrollOptions: ScrollerOptions | undefined;

  // === Cleanup ===
  protected readonly destroy$ = new Subject<void>();

  // === ControlValueAccessor callbacks ===
  private onChangeFn: (value: any) => void = () => {};
  private onTouchedFn: () => void = () => {};

  // === Getter: options to display ===
  get effectiveOptions(): any[] {
    return this.fetchFn ? this.lazyOptions : this.options;
  }

  // === Lifecycle ===

  ngOnInit(): void {
    if (this.fetchFn) {
      this.virtualScroll = true;
      this.filterValue = { ...this.defaultFilter };
      this.virtualScrollOptions = {
        lazy: true,
        showLoader: false,
        delay: 150,
        scrollHeight: '250px',
        onLazyLoad: this.onLazyLoad.bind(this),
      };
      this.loadData(1, this.pageSize, this.filterValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // === ControlValueAccessor ===

  writeValue(value: any): void {
    if (value === this.selectedValue) return;
    this.selectedValue = value;

    if (this.fetchFn && value != null) {
      const key = this.optionValue;
      const hasItem = this.lazyOptions.some(
        (item) => String(item[key]) === String(value),
      );
      if (!hasItem) {
        this.loadSelectedItem(value);
      }
    }
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

  // === Event Handlers ===

  onValueChange(value: any): void {
    this.selectedValue = value;
    this.onChangeFn(value);
    this.onTouchedFn();
  }

  onFilterChange(event: any): void {
    if (!this.fetchFn) return;

    this.filterValue = { ...this.defaultFilter, search: event.filter };
    this.currentPage = 1;
    this.lazyOptions = [];
    this.loadData(1, this.pageSize, this.filterValue);
  }

  // === Lazy Load ===

  onLazyLoad(event: any): void {
    if (!this.fetchFn) return;

    const threshold = 2;
    if (event.last < this.lazyOptions.length - threshold) return;
    if (this.lazyOptions.length >= this.total || this.isLoading) return;

    this.currentPage++;
    this.loadData(this.currentPage, this.pageSize, this.filterValue);
  }

  protected loadData(page: number, pageSize: number, filter?: any): void {
    if (!this.fetchFn) return;

    if (page === 1) {
      this.lazyOptions = [];
      this.currentPage = 1;
      this.isLoading = true;
    }

    this.fetchFn(page, pageSize, filter)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          const merged = [...this.lazyOptions, ...response.results];
          const key = this.optionValue;
          this.lazyOptions = Array.from(
            new Map(merged.map((item) => [item[key], item])).values(),
          );
          this.total = response.total;

          if (this.lazyOptions.length >= this.total && this.virtualScrollOptions) {
            this.virtualScrollOptions = {
              ...this.virtualScrollOptions,
              lazy: false,
            };
          }
        },
      });
  }

  private loadSelectedItem(value: any): void {
    if (!this.fetchFn) return;

    const key = this.optionValue;
    const inList = this.lazyOptions.some(
      (item) => String(item[key]) === String(value),
    );
    if (inList) return;

    this.fetchFn(1, 1, { Id: value })
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.results?.length > 0) {
            const item = response.results[0];
            const merged = [...this.lazyOptions, item];
            this.lazyOptions = Array.from(
              new Map(merged.map((x) => [x[key], x])).values(),
            );
          }
        },
      });
  }
}
