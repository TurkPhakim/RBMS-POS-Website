import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-address-dialog',
  standalone: false,
  templateUrl: './address-dialog.component.html',
})
export class AddressDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly fb: FormBuilder,
  ) {
    this.isEditMode = !!this.config.data?.address;

    this.form = this.fb.group({
      addressType: [null, [Validators.required]],
      houseNumber: ['', [Validators.required, Validators.maxLength(50)]],
      building: ['', [Validators.maxLength(100)]],
      moo: ['', [Validators.maxLength(20)]],
      soi: ['', [Validators.maxLength(100)]],
      yaek: ['', [Validators.maxLength(100)]],
      road: ['', [Validators.maxLength(100)]],
      subDistrict: ['', [Validators.required, Validators.maxLength(100)]],
      district: ['', [Validators.required, Validators.maxLength(100)]],
      province: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode: ['', [Validators.required, Validators.maxLength(10)]],
    });

    if (this.isEditMode) {
      this.form.patchValue(this.config.data.address);
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
