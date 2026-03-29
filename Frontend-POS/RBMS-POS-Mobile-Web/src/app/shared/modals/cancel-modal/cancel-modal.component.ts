import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogData } from '@core/services/modal.service';

@Component({
  selector: 'app-cancel-modal',
  standalone: false,
  template: `
    <div class="flex flex-col gap-2 items-center text-center">
      <img src="images/cancel-image.png" alt="error" class="w-14 h-14" />
      <div class="text-base font-semibold whitespace-nowrap">{{ config.data?.title }}</div>
      @if (messages.length > 0) {
        <div class="text-sm text-surface-sub">
          @for (line of messages; track line) {
            <p class="whitespace-nowrap">{{ line }}</p>
          }
        </div>
      }
      @if (config.data?.isShowConfirmButton ?? true) {
        <div class="flex justify-center w-full mt-1">
          <div class="w-[100px]">
            <p-button [fluid]="true" severity="primary" (onClick)="ref.close()">
              {{ config.data?.confirmButtonLabel ?? "ปิด" }}
            </p-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class CancelModalComponent {
  constructor(
    readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig<DialogData>,
  ) {}

  get messages(): string[] {
    const msg = this.config.data?.message;
    if (!msg) return [];
    if (Array.isArray(msg)) return msg;
    return msg.split('\n');
  }
}
