import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AnimationOptions } from 'ngx-lottie';
import { DialogData } from '@core/services/modal.service';

@Component({
  selector: 'app-success-modal',
  standalone: false,
  template: `
    <div class="flex flex-col gap-2 items-center text-center">
      <ng-lottie [options]="lottieOptions" width="100px" height="100px"></ng-lottie>
      <div class="text-base font-semibold whitespace-nowrap">{{ config.data?.title }}</div>
      @if (config.data?.message) {
        <p class="text-sm text-surface-sub whitespace-nowrap">{{ config.data?.message }}</p>
      }
      @if (config.data?.onConfirm) {
        <div class="flex items-center gap-3">
          <p-button severity="secondary" [outlined]="true" [style]="{ 'min-width': '80px' }" (onClick)="ref.close()">
            ปิด
          </p-button>
          <p-button severity="primary" [style]="{ 'min-width': '120px', 'white-space': 'nowrap' }" (onClick)="handleConfirm()">
            {{ config.data?.confirmButtonLabel ?? "ตกลง" }}
          </p-button>
        </div>
      }
    </div>
  `,
})
export class SuccessModalComponent implements OnInit, OnDestroy {
  private timer?: ReturnType<typeof setTimeout>;

  lottieOptions: AnimationOptions = {
    path: 'animations/success.json',
  };

  constructor(
    readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig<DialogData>,
  ) {}

  ngOnInit(): void {
    if (!this.config.data?.onConfirm) {
      this.timer = setTimeout(() => this.ref.close(), 2000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  handleConfirm(): void {
    const callback = this.config.data?.onConfirm;
    if (callback) callback();
    this.ref.close(true);
  }
}
