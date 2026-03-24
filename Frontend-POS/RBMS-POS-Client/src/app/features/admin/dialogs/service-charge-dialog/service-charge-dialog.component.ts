import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import {
  CreateServiceChargeRequestModel,
  ServiceChargeResponseModel,
  UpdateServiceChargeRequestModel,
} from '@app/core/api/models';
import { ServiceChargesService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { linkDateRange, markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-service-charge-dialog',
  standalone: false,
  templateUrl: './service-charge-dialog.component.html',
})
export class ServiceChargeDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  minEndDate = signal<Date | null>(null);

  serviceCharge: ServiceChargeResponseModel | null = null;
  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly serviceChargesService: ServiceChargesService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('service-charge.update');
  }

  ngOnInit(): void {
    this.serviceCharge = this.config.data?.serviceCharge ?? null;
    this.isEditMode.set(!!this.serviceCharge);
    this.initForm();
    linkDateRange(this.form, 'startDate', 'endDate', this.minEndDate, this.destroyRef);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.value;
    const data = {
      ...formValue,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString() : null,
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null,
    };

    if (this.isEditMode()) {
      this.updateServiceCharge(data);
    } else {
      this.createServiceCharge(data);
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private initForm(): void {
    const sc = this.serviceCharge;
    this.form = this.fb.group({
      name: [sc?.name ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      percentageRate: [sc?.percentageRate ?? null, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: [sc?.description ?? '', [Validators.maxLength(500)]],
      isActive: [sc?.isActive ?? true],
      startDate: [sc?.startDate ? new Date(sc.startDate) : null],
      endDate: [sc?.endDate ? new Date(sc.endDate) : null],
    });

    if (this.isEditMode() && !this.canUpdate) {
      this.form.disable();
    }
  }

  private createServiceCharge(data: CreateServiceChargeRequestModel): void {
    this.serviceChargesService
      .serviceChargesCreatePost({ body: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: error.error?.message || 'ไม่สามารถสร้างค่าบริการได้',
          });
        },
      });
  }

  private updateServiceCharge(data: UpdateServiceChargeRequestModel): void {
    this.serviceChargesService
      .serviceChargesUpdatePut({
        serviceChargeId: this.serviceCharge!.serviceChargeId!,
        body: data,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: error.error?.message || 'ไม่สามารถอัปเดตค่าบริการได้',
          });
        },
      });
  }
}
