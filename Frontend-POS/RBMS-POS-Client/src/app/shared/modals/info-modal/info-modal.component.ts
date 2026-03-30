import { Component, OnDestroy } from '@angular/core';
import { finalize, from, isObservable, of, Subject, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  DialogData,
  Icon,
  ModalService,
} from '@app/core/services/modal.service';

@Component({
  selector: 'app-info-modal',
  standalone: false,
  template: `
    <div class="flex flex-col gap-4 items-center text-center pt-2">
      @switch (config.data?.icon) {
        @case (Icon.Question) {
          <img
            src="images/question-image.png"
            alt="question"
            class="w-20 h-20"
          />
        }
        @case (Icon.Info) {
          <img src="images/question-image.png" alt="info" class="w-20 h-20" />
        }
        @case (Icon.Warning) {
          <img src="images/warning-image.png" alt="warning" class="w-20 h-20" />
        }
        @default {
          <img src="images/warning-image.png" alt="warning" class="w-20 h-20" />
        }
      }
      <div class="text-2xl font-semibold whitespace-pre-line">
        {{ config.data?.title }}
      </div>
      @if (messageText) {
        <p class="text-surface-sub whitespace-pre-line">{{ messageText }}</p>
      }
      <div class="flex w-full gap-3">
        <p-button
          class="flex-1"
          [fluid]="true"
          [severity]="'secondary'"
          [outlined]="true"
          (onClick)="handleCancel()"
        >
          {{ config.data?.cancelButtonLabel ?? 'ยกเลิก' }}
        </p-button>
        <p-button
          class="flex-1"
          [fluid]="true"
          severity="primary"
          [loading]="confirmLoading"
          (onClick)="handleConfirm()"
        >
          {{ config.data?.confirmButtonLabel ?? 'ยืนยัน' }}
        </p-button>
      </div>
    </div>
  `,
})
export class InfoModalComponent implements OnDestroy {
  readonly Icon = Icon;
  confirmLoading = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig<DialogData>,
    private readonly modalService: ModalService,
  ) {}

  get messageText(): string {
    const msg = this.config.data?.message;
    if (!msg) return '';
    return Array.isArray(msg) ? msg.join('\n') : msg;
  }

  handleConfirm(): void {
    const cb = this.config.data?.onConfirm;
    if (!cb) {
      this.ref.close(true);
      return;
    }

    const maybe$ = cb();
    let stream$;

    if (isObservable(maybe$)) {
      stream$ = maybe$;
    } else if (maybe$ instanceof Promise) {
      stream$ = from(maybe$);
    } else {
      stream$ = of(maybe$);
    }

    this.confirmLoading = true;
    stream$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.confirmLoading = false)),
      )
      .subscribe({
        next: (res) => this.ref.close(res ?? true),
        error: (err) => {
          if (this.config.data?.customError) {
            this.ref.close(err);
          } else {
            this.ref.close(false);
            this.modalService.cancel({
              title: 'ผิดพลาด !',
              message:
                err?.error?.message ??
                err?.message ??
                'เกิดข้อผิดพลาดในการทำรายการ',
              confirmButtonLabel: 'ปิด',
            });
          }
        },
      });
  }

  handleCancel(): void {
    this.config.data?.onCancel?.();
    this.ref.close(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
