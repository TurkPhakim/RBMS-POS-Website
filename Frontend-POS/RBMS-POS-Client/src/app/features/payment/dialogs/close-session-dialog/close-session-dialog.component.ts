import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-close-session-dialog',
  standalone: false,
  templateUrl: './close-session-dialog.component.html',
})
export class CloseSessionDialogComponent {
  form: FormGroup;
  isSaving = signal(false);
  session: CashierSessionResponseModel;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private cashierSessionsService: CashierSessionsService,
    private modalService: ModalService,
    private destroyRef: DestroyRef
  ) {
    this.session = this.config.data.session;
    this.form = this.fb.group({
      actualCash: [null, [Validators.required, Validators.min(0)]],
    });
  }

  onSave(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.modalService.info({
      title: 'ยืนยันปิดกะ',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการปิดกะแคชเชียร์?',
      onConfirm: () => {
        this.isSaving.set(true);
        this.cashierSessionsService.cashierSessionsCloseSessionPost({
          cashierSessionId: this.session.cashierSessionId!,
          body: this.form.value,
        })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.ref.close(true);
            },
            error: () => this.isSaving.set(false),
          });
      },
    });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
