import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HumanResourceService } from '@app/core/api/services';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EGender, EEmploymentStatus } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_SAVE = 'save-employee';
const KEY_BTN_BACK = 'back';

@Component({
  selector: 'app-employee-manage',
  standalone: false,
  templateUrl: './employee-manage.component.html',
})
export class EmployeeManageComponent implements OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  employeeId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  genderOptions = [
    { value: 1 as EGender, label: 'ชาย' },
    { value: 2 as EGender, label: 'หญิง' },
    { value: 3 as EGender, label: 'อื่นๆ' },
  ];

  statusOptions = [
    { value: 1 as EEmploymentStatus, label: 'ทำงาน' },
    { value: 2 as EEmploymentStatus, label: 'ไม่ทำงาน' },
    { value: 3 as EEmploymentStatus, label: 'ลาหยุด' },
    { value: 4 as EEmploymentStatus, label: 'สิ้นสุดการจ้าง' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly humanResourceService: HumanResourceService,
    private readonly apiConfig: ApiConfiguration,
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
        label: this.isEditMode() ? 'บันทึกการแก้ไข' : 'บันทึก',
        icon: 'pi pi-check',
        callback: () => this.onSubmit(),
      },
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      firstNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      firstNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      gender: [1 as EGender, [Validators.required]],
      positionId: [null as number | null],
      employmentStatus: [1 as EEmploymentStatus, [Validators.required]],
      startDate: [null as Date | null, [Validators.required]],
      title: ['', [Validators.maxLength(50)]],
      nickname: ['', [Validators.maxLength(50)]],
      email: ['', [Validators.email, Validators.maxLength(200)]],
      phone: ['', [Validators.maxLength(20)]],
      nationalId: ['', [Validators.maxLength(20)]],
      dateOfBirth: [null as Date | null],
      age: [{ value: '', disabled: true }],
      salary: [null, [Validators.min(0)]],
      bankName: ['', [Validators.maxLength(200)]],
      bankAccountNumber: ['', [Validators.maxLength(50)]],
      endDate: [null as Date | null],
      imageUrl: [''],
      isActive: [true],
      userId: [''],
    });

    this.form.get('dateOfBirth')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateOfBirth) => {
        this.calculateAge(dateOfBirth);
      });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('employeeId');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(+id);
      this.loadEmployee(+id);
    }
  }

  loadEmployee(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.humanResourceService
      .apiHumanresourceEmployeeIdGet({ employeeId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.form.patchValue({
              firstNameThai: response.result.firstNameThai,
              lastNameThai: response.result.lastNameThai,
              firstNameEnglish: response.result.firstNameEnglish,
              lastNameEnglish: response.result.lastNameEnglish,
              gender: response.result.gender,
              positionId: response.result.positionId,
              employmentStatus: response.result.employmentStatus,
              startDate: response.result.startDate
                ? new Date(response.result.startDate)
                : null,
              title: response.result.title,
              nickname: response.result.nickname,
              email: response.result.email,
              phone: response.result.phone,
              nationalId: response.result.nationalId,
              dateOfBirth: response.result.dateOfBirth
                ? new Date(response.result.dateOfBirth)
                : null,
              salary: response.result.salary,
              bankName: response.result.bankName,
              bankAccountNumber: response.result.bankAccountNumber,
              endDate: response.result.endDate
                ? new Date(response.result.endDate)
                : null,
              isActive: response.result.isActive,
              userId: response.result.userId,
            });

            if (response.result.imageFileId) {
              this.imagePreview.set(
                `${this.apiConfig.rootUrl}/api/admin/file/${response.result.imageFileId}`
              );
            }

            if (response.result.dateOfBirth) {
              this.calculateAge(new Date(response.result.dateOfBirth));
            }
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลพนักงานได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
        this.showErrorModal.set(true);
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.errorMessage.set('ขนาดรูปภาพต้องไม่เกิน 5MB');
        this.showErrorModal.set(true);
        return;
      }

      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.form.patchValue({ imageUrl: '' });
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

    const f = this.form.value;
    const body = {
      Title: f.title as string | undefined,
      FirstNameThai: f.firstNameThai as string,
      LastNameThai: f.lastNameThai as string,
      FirstNameEnglish: f.firstNameEnglish as string,
      LastNameEnglish: f.lastNameEnglish as string,
      Nickname: f.nickname as string | undefined,
      Gender: f.gender as EGender,
      DateOfBirth: f.dateOfBirth ? (f.dateOfBirth as Date).toISOString() : undefined,
      StartDate: (f.startDate as Date).toISOString(),
      EndDate: f.endDate ? (f.endDate as Date).toISOString() : undefined,
      NationalId: f.nationalId as string | undefined,
      BankAccountNumber: f.bankAccountNumber as string | undefined,
      BankName: f.bankName as string | undefined,
      EmploymentStatus: f.employmentStatus as EEmploymentStatus,
      PositionId: f.positionId as number | undefined,
      Phone: f.phone as string | undefined,
      Email: f.email as string | undefined,
      Salary: f.salary as number | undefined,
      IsActive: f.isActive as boolean | undefined,
      UserId: f.userId as string | undefined,
      imageFile: this.selectedFile() as Blob | undefined,
    };

    if (this.isEditMode()) {
      this.updateEmployee(body);
    } else {
      this.createEmployee(body);
    }
  }

  private createEmployee(body: Record<string, unknown>): void {
    this.humanResourceService
      .apiHumanresourcePost({ body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(
            `เพิ่มพนักงาน "${this.form.value.firstNameThai} ${this.form.value.lastNameThai}" สำเร็จ`
          );
          this.showSuccessModal.set(true);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถเพิ่มพนักงานได้');
          this.showErrorModal.set(true);
          this.resetSavingState();
        },
      });
  }

  private updateEmployee(body: Record<string, unknown>): void {
    const employeeId = this.employeeId()!;

    this.humanResourceService
      .apiHumanresourceEmployeeIdPut({ employeeId, body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(
            `แก้ไขพนักงาน "${this.form.value.firstNameThai} ${this.form.value.lastNameThai}" สำเร็จ`
          );
          this.showSuccessModal.set(true);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถแก้ไขข้อมูลพนักงานได้');
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
    this.router.navigate(['/hr/employees']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/hr/employees']);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  calculateAge(dateOfBirth: Date | string | null): void {
    if (!dateOfBirth) {
      this.form.get('age')?.setValue('');
      return;
    }

    const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0 || years > 150) {
      this.form.get('age')?.setValue('วันที่ไม่ถูกต้อง');
      return;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ปี`);
    if (months > 0) parts.push(`${months} เดือน`);
    if (days > 0) parts.push(`${days} วัน`);

    this.form.get('age')?.setValue(parts.length > 0 ? parts.join(' ') : 'เกิดวันนี้');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'กรุณากรอกข้อมูล';
    if (field.errors['maxlength'])
      return `ห้ามเกิน ${field.errors['maxlength'].requiredLength} ตัวอักษร`;
    if (field.errors['min'])
      return `ค่าต้องไม่น้อยกว่า ${field.errors['min'].min}`;
    if (field.errors['email']) return 'รูปแบบอีเมลไม่ถูกต้อง';

    return '';
  }
}
