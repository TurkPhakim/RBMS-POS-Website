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
  templateUrl: './info-modal.component.html',
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
