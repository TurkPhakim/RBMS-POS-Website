import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-cash-drawer-dialog',
  standalone: false,
  templateUrl: './cash-drawer-dialog.component.html',
})
export class CashDrawerDialogComponent {
  form: FormGroup;
  isSaving = signal(false);
  type: 'cash-in' | 'cash-out';
  sessionId: number;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private cashierSessionsService: CashierSessionsService,
    private modalService: ModalService,
    private destroyRef: DestroyRef
  ) {
    this.type = this.config.data.type;
    this.sessionId = this.config.data.sessionId;
    this.form = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      reason: [null, [Validators.required, Validators.maxLength(500)]],
    });
  }

  get isCashIn(): boolean {
    return this.type === 'cash-in';
  }

  onSave(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const body = this.form.value;

    const request$ = this.isCashIn
      ? this.cashierSessionsService.cashierSessionsCashInPost({
          cashierSessionId: this.sessionId,
          body,
        })
      : this.cashierSessionsService.cashierSessionsCashOutPost({
          cashierSessionId: this.sessionId,
          body,
        });

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => this.isSaving.set(false),
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
