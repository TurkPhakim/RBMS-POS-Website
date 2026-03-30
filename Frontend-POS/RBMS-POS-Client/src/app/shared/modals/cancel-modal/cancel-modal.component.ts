import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogData } from '@app/core/services/modal.service';

@Component({
  selector: 'app-cancel-modal',
  standalone: false,
  template: `
    <div class="flex flex-col gap-4 items-center text-center pt-2">
      <img src="images/cancel-image.png" alt="error" class="w-20 h-20" />
      <div class="text-2xl font-semibold">{{ config.data?.title }}</div>
      @if (messages.length > 0) {
        <div class="text-surface-sub">
          @for (line of messages; track line) {
            <p>{{ line }}</p>
          }
        </div>
      }
      @if (config.data?.isShowConfirmButton ?? true) {
        <div class="flex justify-center w-full">
          <div class="w-[120px]">
            <p-button [fluid]="true" severity="primary" (onClick)="ref.close()">
              {{ config.data?.confirmButtonLabel ?? 'ปิด' }}
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
