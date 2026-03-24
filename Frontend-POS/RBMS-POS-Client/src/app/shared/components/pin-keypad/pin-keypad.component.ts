import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-pin-keypad',
  standalone: false,
  template: `
    <!-- Title -->
    <div class="text-center mb-4">
      <p class="text-xl font-bold text-primary-text">{{ title }}</p>
    </div>

    <!-- Dot Indicators -->
    <div class="flex justify-center gap-4 mb-4">
      @for (filled of dots; track $index) {
        <div
          class="w-6 h-6 rounded-full transition-all duration-200"
          [class.bg-primary]="filled"
          [class.scale-110]="filled"
          [class.bg-surface-border]="!filled"
        ></div>
      }
    </div>

    <!-- Error Message -->
    @if (errorMessage) {
      <div class="text-center mb-2">
        <p class="text-base text-danger font-medium">{{ errorMessage }}</p>
      </div>
    }

    <!-- Numeric Keypad -->
    <div class="grid grid-cols-3 gap-1.5 max-w-[250px] mx-auto mt-3">
      @for (key of keys; track key) {
        @if (key === "") {
          @if (leftActionIcon) {
            <button
              type="button"
              class="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-surface-card border border-surface-border hover:bg-primary-subtle hover:border-primary-light active:bg-primary-light transition-colors duration-150 cursor-pointer mx-auto"
              (click)="leftActionClick.emit()"
            >
              <app-generic-icon
                [name]="leftActionIcon"
                svgClass="w-9 h-9"
                class="text-warning-dark"
              ></app-generic-icon>
            </button>
          } @else {
            <div></div>
          }
        } @else if (key === "backspace") {
          <button
            type="button"
            class="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-surface-card border border-surface-border hover:bg-primary-subtle hover:border-primary-light active:bg-primary-light transition-colors duration-150 cursor-pointer mx-auto"
            (click)="onKeyPress(key)"
          >
            <app-generic-icon
              name="backspace"
              svgClass="w-9 h-9"
              class="text-danger"
            ></app-generic-icon>
          </button>
        } @else {
          <button
            type="button"
            class="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-surface-card border border-surface-border hover:bg-primary-subtle hover:border-primary-light active:bg-primary-light transition-colors duration-150 cursor-pointer text-2xl font-semibold mx-auto"
            (click)="onKeyPress(key)"
          >
            {{ key }}
          </button>
        }
      }
    </div>
  `,
})
export class PinKeypadComponent {
  @Input() title = '';
  @Input() errorMessage = '';
  @Input() pinLength = 6;
  @Input() leftActionIcon = '';
  @Output() pinComplete = new EventEmitter<string>();
  @Output() leftActionClick = new EventEmitter<void>();

  enteredDigits = signal('');

  readonly keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '',
    '0',
    'backspace',
  ];

  get dots(): boolean[] {
    const entered = this.enteredDigits().length;
    return Array.from({ length: this.pinLength }, (_, i) => i < entered);
  }

  onKeyPress(key: string): void {
    if (key === '') return;

    if (key === 'backspace') {
      this.enteredDigits.update((d) => d.slice(0, -1));
      return;
    }

    const current = this.enteredDigits();
    if (current.length >= this.pinLength) return;

    const newDigits = current + key;
    this.enteredDigits.set(newDigits);

    if (newDigits.length === this.pinLength) {
      setTimeout(() => this.pinComplete.emit(newDigits), 300);
    }
  }

  reset(): void {
    this.enteredDigits.set('');
  }
}
