import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-education-dialog',
  standalone: false,
  templateUrl: './education-dialog.component.html',
})
export class EducationDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
  ) {
    this.isEditMode = !!this.config.data?.education;

    this.form = this.fb.group({
      educationLevel: ['', [Validators.required, Validators.maxLength(100)]],
      major: ['', [Validators.required, Validators.maxLength(200)]],
      institution: ['', [Validators.required, Validators.maxLength(200)]],
      gpa: [null, [Validators.min(0), Validators.max(4)]],
      graduationYear: [null],
    });

    if (this.isEditMode) {
      this.form.patchValue(this.config.data.education);
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }
    this.ref.close(this.form.value);
  }

  onCancel(): void {
    this.ref.close();
  }
}
