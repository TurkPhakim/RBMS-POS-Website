import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PositionsService } from '@app/core/api/services';
import { PositionDropdownModel } from '@app/core/api/models';

@Component({
  selector: 'app-position-dropdown',
  standalone: false,
  template: `
    <p-dropdown
      [options]="options()"
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      optionLabel="positionName"
      optionValue="positionId"
      [placeholder]="placeholder"
      [showClear]="showClear"
      [disabled]="disabled"
      [styleClass]="styleClass"
      appendTo="body">
    </p-dropdown>
  `,
})
export class PositionDropdownComponent implements OnInit {
  @Input() value: number | null = null;
  @Input() placeholder = 'เลือกตำแหน่ง';
  @Input() showClear = true;
  @Input() disabled = false;
  @Input() styleClass = 'w-full';
  @Output() valueChange = new EventEmitter<number | null>();

  options = signal<PositionDropdownModel[]>([]);

  constructor(
    private readonly positionsService: PositionsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.positionsService
      .apiAdminPositionsDropdownGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.options.set(response.results ?? []);
        },
      });
  }

  onValueChange(val: number | null): void {
    this.value = val;
    this.valueChange.emit(val);
  }
}
