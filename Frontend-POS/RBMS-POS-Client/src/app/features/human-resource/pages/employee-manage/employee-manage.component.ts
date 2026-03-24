import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import {
  EGender,
  ENationality,
  EReligion,
  ETitle,
  EmployeeAddressResponseModel,
  EmployeeEducationResponseModel,
  EmployeeWorkHistoryResponseModel,
} from '@app/core/api/models';
import { HumanResourceService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { linkDateRange, markFormDirty } from '@app/shared/utils';
import { AddressDialogComponent } from '@app/shared/dialogs/address-dialog/address-dialog.component';
import { EducationDialogComponent } from '@app/shared/dialogs/education-dialog/education-dialog.component';
import { WorkHistoryDialogComponent } from '@app/shared/dialogs/work-history-dialog/work-history-dialog.component';
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
  isSaving = signal(false);
  serverImageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  imageRemoved = signal(false);

  minEndDate = signal<Date | null>(null);
  isReadOnly = false;
  addresses = signal<EmployeeAddressResponseModel[]>([]);
  educations = signal<EmployeeEducationResponseModel[]>([]);
  workHistories = signal<EmployeeWorkHistoryResponseModel[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly fb: FormBuilder,
    private readonly humanResourceService: HumanResourceService,
    private readonly modalService: ModalService,
    private readonly router: Router,
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
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onCancel(),
      },
    });

    if (!this.isReadOnly) {
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
      firstNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      firstNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      gender: [null as EGender | null, [Validators.required]],
      positionId: [null as number | null, [Validators.required]],
      startDate: [null as Date | null, [Validators.required]],
      title: [null as ETitle | null, [Validators.required]],
      nickname: ['', [Validators.required, Validators.maxLength(50)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      nationalId: ['', [Validators.required, Validators.maxLength(13)]],
      nationality: [null as number | null, [Validators.required]],
      religion: [null as number | null, [Validators.required]],
      lineId: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: [null as Date | null, [Validators.required]],
      age: [{ value: '', disabled: true }],
      isFullTime: [true],
      salary: [null, [Validators.min(0)]],
      hourlyRate: [null, [Validators.min(0)]],
      bankName: ['', [Validators.maxLength(100)]],
      bankAccountNumber: ['', [Validators.maxLength(20)]],
      endDate: [null as Date | null],
      imageUrl: [''],
      isActive: [true],
      userId: [''],
    });

    this.form
      .get('dateOfBirth')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateOfBirth) => {
        this.calculateAge(dateOfBirth);
      });

    linkDateRange(
      this.form,
      'startDate',
      'endDate',
      this.minEndDate,
      this.destroyRef,
    );

    this.form
      .get('isFullTime')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isFullTime) => {
        if (isFullTime) {
          this.form.get('hourlyRate')?.setValue(null);
        } else {
          this.form.get('salary')?.setValue(null);
        }
      });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('employeeId');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(+id);
      this.isReadOnly = !this.authService.hasPermission('employee.update');
      this.loadEmployee(+id);
    }
  }

  loadEmployee(id: number): void {
    this.humanResourceService
      .humanResourceGetByIdGet({ employeeId: id })
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
              startDate: response.result.startDate
                ? new Date(response.result.startDate)
                : null,
              title: response.result.title,
              nickname: response.result.nickname,
              email: response.result.email,
              phone: response.result.phone,
              nationalId: response.result.nationalId,
              nationality: response.result.nationality,
              religion: response.result.religion,
              lineId: response.result.lineId ?? '',
              dateOfBirth: response.result.dateOfBirth
                ? new Date(response.result.dateOfBirth)
                : null,
              isFullTime: response.result.isFullTime ?? true,
              salary: response.result.salary,
              hourlyRate: response.result.hourlyRate,
              bankName: response.result.bankName,
              bankAccountNumber: response.result.bankAccountNumber,
              endDate: response.result.endDate
                ? new Date(response.result.endDate)
                : null,
              isActive: response.result.isActive,
              userId: response.result.userId,
            });

            if (response.result.imageFileId) {
              this.serverImageUrl.set(
                `${this.apiConfig.rootUrl}/api/admin/file/${response.result.imageFileId}`,
              );
            }

            if (response.result.dateOfBirth) {
              this.calculateAge(new Date(response.result.dateOfBirth));
            }

            this.addresses.set(response.result.addresses ?? []);
            this.educations.set(response.result.educations ?? []);
            this.workHistories.set(response.result.workHistories ?? []);

            if (this.isReadOnly) {
              this.form.disable();
            }
          }
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลพนักงานได้',
          });
        },
      });
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.imageRemoved.set(false);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imageRemoved.set(true);
    this.form.patchValue({ imageUrl: '' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);

    const f = this.form.value;
    const body = {
      Title: f.title as ETitle,
      FirstNameThai: f.firstNameThai as string,
      LastNameThai: f.lastNameThai as string,
      FirstNameEnglish: f.firstNameEnglish as string,
      LastNameEnglish: f.lastNameEnglish as string,
      Nickname: (f.nickname ?? '') as string,
      Gender: f.gender as EGender,
      DateOfBirth: f.dateOfBirth ? (f.dateOfBirth as Date).toISOString() : '',
      StartDate: (f.startDate as Date).toISOString(),
      EndDate: f.endDate ? (f.endDate as Date).toISOString() : undefined,
      NationalId: (f.nationalId ?? '') as string,
      BankAccountNumber: f.bankAccountNumber as string | undefined,
      BankName: f.bankName as string | undefined,
      Nationality: f.nationality as ENationality,
      Religion: f.religion as EReligion,
      LineId: (f.lineId ?? '') as string,
      PositionId: f.positionId as number,
      Phone: (f.phone ?? '') as string,
      Email: (f.email ?? '') as string,
      IsFullTime: f.isFullTime as boolean,
      Salary: f.salary as number | undefined,
      HourlyRate: f.hourlyRate as number | undefined,
      IsActive: f.isActive as boolean | undefined,
      UserId: f.userId as string | undefined,
      imageFile: this.selectedFile() as Blob | undefined,
      RemoveImage: this.imageRemoved(),
      Addresses: this.addresses().map((a) => ({
        addressType: a.addressType!,
        houseNumber: a.houseNumber,
        building: a.building,
        moo: a.moo,
        soi: a.soi,
        yaek: a.yaek,
        road: a.road,
        subDistrict: a.subDistrict,
        district: a.district,
        province: a.province,
        postalCode: a.postalCode,
      })),
      Educations: this.educations().map((e) => ({
        educationLevel: e.educationLevel!,
        major: e.major!,
        institution: e.institution!,
        gpa: e.gpa,
        graduationYear: e.graduationYear,
      })),
      WorkHistories: this.workHistories().map((w) => ({
        workplace: w.workplace!,
        workPhone: w.workPhone,
        position: w.position!,
        startDate: w.startDate!,
        endDate: w.endDate,
      })),
    };

    if (this.isEditMode()) {
      this.humanResourceService
        .humanResourceUpdatePut({ employeeId: this.employeeId()!, body })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.resetSavingState();
            this.modalService.commonSuccess();
            this.router.navigate(['/human-resource/employees']);
          },
          error: () => {
            this.modalService.cancel({
              title: 'ผิดพลาด !',
              message: 'ไม่สามารถแก้ไขข้อมูลพนักงานได้',
            });
            this.resetSavingState();
          },
        });
    } else {
      this.humanResourceService
        .humanResourceCreatePost({ body })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.resetSavingState();
            this.modalService.commonSuccess();
            this.router.navigate(['/human-resource/employees']);
          },
          error: () => {
            this.modalService.cancel({
              title: 'ผิดพลาด !',
              message: 'ไม่สามารถเพิ่มพนักงานได้',
            });
            this.resetSavingState();
          },
        });
    }
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, false);
  }

  onCancel(): void {
    this.router.navigate(['/human-resource/employees']);
  }

  // === Address Dialog ===
  onAddAddress(): void {
    const ref = this.dialogService.open(AddressDialogComponent, {
      header: 'เพิ่มที่อยู่',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: {},
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.addresses.update((list) => [...list, result]);
        }
      });
  }

  onEditAddress(address: EmployeeAddressResponseModel, index: number): void {
    const ref = this.dialogService.open(AddressDialogComponent, {
      header: 'แก้ไขที่อยู่',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { address },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.addresses.update((list) =>
            list.map((item, i) =>
              i === index ? { ...item, ...result } : item,
            ),
          );
        }
      });
  }

  onDeleteAddress(index: number): void {
    this.addresses.update((list) => list.filter((_, i) => i !== index));
  }

  getAddressTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'ที่อยู่ตามทะเบียนบ้าน';
      case 2:
        return 'ที่อยู่ปัจจุบัน';
      case 3:
        return 'ที่อยู่ที่ทำงาน';
      default:
        return 'ไม่ระบุ';
    }
  }

  // === Education Dialog ===
  onAddEducation(): void {
    const ref = this.dialogService.open(EducationDialogComponent, {
      header: 'เพิ่มประวัติการศึกษา',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: {},
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.educations.update((list) => [...list, result]);
        }
      });
  }

  onEditEducation(
    education: EmployeeEducationResponseModel,
    index: number,
  ): void {
    const ref = this.dialogService.open(EducationDialogComponent, {
      header: 'แก้ไขประวัติการศึกษา',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { education },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.educations.update((list) =>
            list.map((item, i) =>
              i === index ? { ...item, ...result } : item,
            ),
          );
        }
      });
  }

  onDeleteEducation(index: number): void {
    this.educations.update((list) => list.filter((_, i) => i !== index));
  }

  // === Work History Dialog ===
  onAddWorkHistory(): void {
    const ref = this.dialogService.open(WorkHistoryDialogComponent, {
      header: 'เพิ่มประวัติการทำงาน',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: {},
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.workHistories.update((list) => [...list, result]);
        }
      });
  }

  onEditWorkHistory(
    workHistory: EmployeeWorkHistoryResponseModel,
    index: number,
  ): void {
    const ref = this.dialogService.open(WorkHistoryDialogComponent, {
      header: 'แก้ไขประวัติการทำงาน',
      width: '60vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { workHistory },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.workHistories.update((list) =>
            list.map((item, i) =>
              i === index ? { ...item, ...result } : item,
            ),
          );
        }
      });
  }

  onDeleteWorkHistory(index: number): void {
    this.workHistories.update((list) => list.filter((_, i) => i !== index));
  }

  checkDuplicate(field: 'nationalId' | 'email'): void {
    const control = this.form.get(field);
    if (
      !control ||
      !control.value ||
      control.hasError('email') ||
      control.hasError('maxlength')
    )
      return;

    this.humanResourceService
      .humanResourceCheckDuplicateGet({
        field,
        value: control.value,
        excludeEmployeeId: this.employeeId() ?? undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result) {
            const msg =
              field === 'nationalId'
                ? 'เลขประจำตัวประชาชนนี้มีอยู่ในระบบแล้ว'
                : 'อีเมลนี้มีอยู่ในระบบแล้ว';
            control.setErrors({ ...control.errors, duplicate: msg });
          } else if (control.hasError('duplicate')) {
            const { duplicate, ...rest } = control.errors!;
            control.setErrors(Object.keys(rest).length ? rest : null);
          }
        },
      });
  }

  calculateAge(dateOfBirth: Date | string | null): void {
    if (!dateOfBirth) {
      this.form.get('age')?.setValue('');
      return;
    }

    const birthDate =
      dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
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

    this.form
      .get('age')
      ?.setValue(parts.length > 0 ? parts.join(' ') : 'เกิดวันนี้');
  }

  getWorkDuration(
    startDate: string | null | undefined,
    endDate: string | null | undefined,
  ): string {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ปี`);
    if (months > 0) parts.push(`${months} เดือน`);
    if (days > 0) parts.push(`${days} วัน`);

    return parts.length > 0 ? parts.join(' ') : 'เริ่มงานวันนี้';
  }
}
