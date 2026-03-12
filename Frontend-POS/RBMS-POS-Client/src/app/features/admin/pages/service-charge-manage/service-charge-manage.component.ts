// 1. Angular core
import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// 2. Services & Models
import { ServiceChargesService } from '@app/core/api/services';
import {
  CreateServiceChargeRequestModel,
  UpdateServiceChargeRequestModel,
} from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

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
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly serviceChargesService: ServiceChargesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupBreadcrumbButtons();
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
        label: 'กลับ',
        icon: 'pi pi-arrow-left',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onCancel(),
      },
    });

    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_SAVE,
      type: 'button',
      item: {
        key: KEY_BTN_SAVE,
        label: this.isEditMode() ? 'อัปเดต' : 'สร้าง',
        icon: 'pi pi-check',
        callback: () => this.onSubmit(),
      },
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      percentageRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('serviceChargeId');
    if (id) {
      this.isEditMode.set(true);
      this.serviceChargeId.set(+id);
      this.loadServiceCharge(+id);
    }
  }

  loadServiceCharge(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.serviceChargesService
      .apiAdminServicechargesServiceChargeIdGet({ serviceChargeId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.form.patchValue({
              name: response.result.name,
              percentageRate: response.result.percentageRate,
              description: response.result.description,
              isActive: response.result.isActive,
            });
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูล Service Charge ได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);
    this.errorMessage.set(null);

    const formValue = this.form.value;

    if (this.isEditMode()) {
      this.updateServiceCharge(formValue);
    } else {
      this.createServiceCharge(formValue);
    }
  }

  createServiceCharge(data: CreateServiceChargeRequestModel): void {
    this.serviceChargesService
      .apiAdminServicechargesPost({ body: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(`สร้าง Service Charge "${data.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'ไม่สามารถสร้าง Service Charge ได้');
          this.showErrorModal.set(true);
          this.resetSavingState();
        },
      });
  }

  updateServiceCharge(data: UpdateServiceChargeRequestModel): void {
    const id = this.serviceChargeId()!;

    this.serviceChargesService
      .apiAdminServicechargesServiceChargeIdPut({ serviceChargeId: id, body: data })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(`อัปเดต Service Charge "${data.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'ไม่สามารถอัปเดต Service Charge ได้');
          this.showErrorModal.set(true);
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

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/admin-setting/service-charges']);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['minlength'])
      return `กรุณากรอกอย่างน้อย ${field.errors['minlength'].requiredLength} ตัวอักษร`;
    if (field.errors['maxlength'])
      return `กรอกได้ไม่เกิน ${field.errors['maxlength'].requiredLength} ตัวอักษร`;
    if (field.errors['min'])
      return `ค่าต้องไม่ต่ำกว่า ${field.errors['min'].min}`;
    if (field.errors['max'])
      return `ค่าต้องไม่เกิน ${field.errors['max'].max}`;

    return '';
  }
}
