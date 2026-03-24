import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { ModalService } from '@app/core/services/modal.service';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-open-session-dialog',
  standalone: false,
  templateUrl: './open-session-dialog.component.html',
})
export class OpenSessionDialogComponent {
  form: FormGroup;
  isSaving = signal(false);
  hasTwoPeriods: boolean;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private cashierSessionsService: CashierSessionsService,
    private modalService: ModalService,
    private shopBrandingService: ShopBrandingService,
    private destroyRef: DestroyRef
  ) {
    this.hasTwoPeriods = this.shopBrandingService.hasTwoPeriods();
    this.form = this.fb.group({
      openingCash: [0, [Validators.required, Validators.min(0)]],
      shiftPeriod: [null, this.hasTwoPeriods ? [Validators.required] : []],
    });
  }

  onSave(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.cashierSessionsService.cashierSessionsOpenSessionPost({
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
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
