import { Component, DestroyRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { linkDateRange, markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-work-history-dialog',
  standalone: false,
  templateUrl: './work-history-dialog.component.html',
})
export class WorkHistoryDialogComponent {
  form: FormGroup;
  isEditMode: boolean;
  minEndDate = signal<Date | null>(null);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
  ) {
    this.isEditMode = !!this.config.data?.workHistory;

    this.form = this.fb.group({
      workplace: ['', [Validators.required, Validators.maxLength(200)]],
      workPhone: ['', [Validators.maxLength(20)]],
      position: ['', [Validators.required, Validators.maxLength(100)]],
      startDate: [null as Date | null, [Validators.required]],
      endDate: [null as Date | null],
    });

    linkDateRange(this.form, 'startDate', 'endDate', this.minEndDate, this.destroyRef);

    if (this.isEditMode) {
      const wh = this.config.data.workHistory;
      this.form.patchValue({
        ...wh,
        startDate: wh.startDate ? new Date(wh.startDate) : null,
        endDate: wh.endDate ? new Date(wh.endDate) : null,
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    const value = this.form.value;
    this.ref.close({
      ...value,
      startDate: value.startDate ? (value.startDate as Date).toISOString() : null,
      endDate: value.endDate ? (value.endDate as Date).toISOString() : null,
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
