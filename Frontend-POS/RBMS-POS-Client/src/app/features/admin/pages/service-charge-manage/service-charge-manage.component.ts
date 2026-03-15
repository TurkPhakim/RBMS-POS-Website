import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CreateServiceChargeRequestModel, UpdateServiceChargeRequestModel } from '@app/core/api/models';
import { ServiceChargesService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';

import { linkDateRange, markFormDirty } from '@app/shared/utils';

const KEY_BTN_SAVE = 'save-service-charge';
const KEY_BTN_BACK = 'back';

@Component({
  selector: 'app-service-charge-manage',
  standalone: false,
  templateUrl: './service-charge-manage.component.html',
})
export class ServiceChargeManageComponent implements OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  serviceChargeId = signal<number | null>(null);
  isSaving = signal(false);
  isReadOnly = signal(false);
  minEndDate = signal<Date | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly serviceChargesService: ServiceChargesService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupBreadcrumbButtons();
    linkDateRange(this.form, 'startDate', 'endDate', this.minEndDate, this.destroyRef);
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onCancel(),
      },
    });

    if (!this.isReadOnly()) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_SAVE,
        type: 'button',
        item: {
          key: KEY_BTN_SAVE,
          label: 'บันทึก',
          callback: () => this.onSubmit(),
        },
      });
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      percentageRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
      startDate: [null],
      endDate: [null],
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('serviceChargeId');
    if (id) {
      this.isEditMode.set(true);
      this.serviceChargeId.set(+id);

      const canUpdate = this.authService.hasPermission('service-charge.update');
      if (!canUpdate) {
        this.isReadOnly.set(true);
      }

      this.loadServiceCharge(+id);
    }
  }

  loadServiceCharge(id: number): void {
    this.serviceChargesService
      .serviceChargesGetByIdGet({ serviceChargeId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.form.patchValue({
              name: response.result.name,
              percentageRate: response.result.percentageRate,
              description: response.result.description,
              isActive: response.result.isActive,
              startDate: response.result.startDate ? new Date(response.result.startDate) : null,
              endDate: response.result.endDate ? new Date(response.result.endDate) : null,
            });

            if (this.isReadOnly()) {
              this.form.disable();
            }
          }
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูล Service Charge ได้' });
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);

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

  createServiceCharge(data: CreateServiceChargeRequestModel): void {
    this.serviceChargesService
      .serviceChargesCreatePost({ body: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/admin-setting/service-charges']);
        },
        error: (error) => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: error.error?.message || 'ไม่สามารถสร้าง Service Charge ได้' });
          this.resetSavingState();
        },
      });
  }

  updateServiceCharge(data: UpdateServiceChargeRequestModel): void {
    const id = this.serviceChargeId()!;

    this.serviceChargesService
      .serviceChargesUpdatePut({ serviceChargeId: id, body: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/admin-setting/service-charges']);
        },
        error: (error) => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: error.error?.message || 'ไม่สามารถอัปเดต Service Charge ได้' });
          this.resetSavingState();
        },
      });
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, false);
  }

  onCancel(): void {
    this.router.navigate(['/admin-setting/service-charges']);
  }
}
