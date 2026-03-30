import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { ModalService } from '@app/core/services/modal.service';
import { VerifyPinDialogComponent } from '@app/shared/dialogs/verify-pin/verify-pin-dialog.component';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-close-session-dialog',
  standalone: false,
  templateUrl: './close-session-dialog.component.html',
  providers: [DialogService],
})
export class CloseSessionDialogComponent {
  form: FormGroup;
  isSaving = signal(false);
  session: CashierSessionResponseModel;

  totalCashIn: number;
  totalCashOut: number;
  expectedCash: number;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private cashierSessionsService: CashierSessionsService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {
    this.session = this.config.data.session;

    const transactions = this.session.cashDrawerTransactions ?? [];
    this.totalCashIn = transactions
      .filter((t) => t.transactionType === 'CashIn')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    this.totalCashOut = transactions
      .filter((t) => t.transactionType === 'CashOut')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    this.expectedCash =
      (this.session.openingCash ?? 0) +
      (this.session.totalCashSales ?? 0) +
      this.totalCashIn -
      this.totalCashOut;

    this.form = this.fb.group({
      actualCash: [null, [Validators.required, Validators.min(0)]],
    });
  }

  onSave(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    const pinRef = this.dialogService.open(VerifyPinDialogComponent, {
      header: 'ยืนยันตัวตน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
    });

    pinRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === true) {
          this.isSaving.set(true);
          this.cashierSessionsService
            .cashierSessionsCloseSessionPost({
              cashierSessionId: this.session.cashierSessionId!,
              body: this.form.value,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.modalService.commonSuccess();
                this.ref.close('success');
              },
              error: () => this.isSaving.set(false),
            });
        } else if (result === 'max-attempts') {
          this.ref.close(false);
        }
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
