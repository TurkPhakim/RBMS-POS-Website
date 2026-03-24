import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <div class="p-5 text-center">
      <p class="text-lg font-semibold">{{ config.data.title }}</p>
      @if (config.data.message) {
        <p class="text-sm text-surface-sub mt-2">{{ config.data.message }}</p>
      }
      <div class="flex gap-3 mt-5 justify-center">
        <button pButton [label]="config.data.cancelLabel || 'ยกเลิก'" severity="secondary" [outlined]="true"
                (click)="ref.close(false)"></button>
        <button pButton [label]="config.data.confirmLabel || 'ยืนยัน'"
                (click)="ref.close(true)"></button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) {}
}
