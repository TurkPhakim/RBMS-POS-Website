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

  private serviceChargeId: number | null = null;
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
    this.serviceChargeId = this.config.data?.serviceChargeId ?? null;
    this.isEditMode.set(!!this.serviceChargeId);
    this.initForm();
    linkDateRange(
      this.form,
      'startDate',
      'endDate',
      this.minEndDate,
      this.destroyRef,
    );

    if (this.serviceChargeId) {
      this.loadDetail(this.serviceChargeId);
    }
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
      startDate: formValue.startDate
        ? new Date(formValue.startDate).toISOString()
        : null,
      endDate: formValue.endDate
        ? new Date(formValue.endDate).toISOString()
        : null,
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
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      percentageRate: [null, [Validators.required]],
      description: [''],
      isActive: [true],
      startDate: [null as Date | null],
      endDate: [null as Date | null],
    });
  }

  private loadDetail(serviceChargeId: number): void {
    this.serviceChargesService
      .serviceChargesGetByIdGet({ serviceChargeId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.serviceCharge = res.result ?? null;
          if (this.serviceCharge) {
            this.form.patchValue({
              name: this.serviceCharge.name,
              percentageRate: this.serviceCharge.percentageRate,
              description: this.serviceCharge.description,
              isActive: this.serviceCharge.isActive,
              startDate: this.serviceCharge.startDate
                ? new Date(this.serviceCharge.startDate)
                : null,
              endDate: this.serviceCharge.endDate
                ? new Date(this.serviceCharge.endDate)
                : null,
            });
            if (!this.canUpdate) this.form.disable();
          }
        },
      });
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
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถสร้างค่าบริการได้',
          });
        },
      });
  }

  private updateServiceCharge(data: UpdateServiceChargeRequestModel): void {
    this.serviceChargesService
      .serviceChargesUpdatePut({
        serviceChargeId: this.serviceChargeId!,
        body: data,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถอัปเดตค่าบริการได้',
          });
        },
      });
  }
}
