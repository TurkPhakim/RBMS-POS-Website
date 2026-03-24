import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import {
  EGender,
  ETitle,
  EmployeeAddressResponseModel,
  EmployeeEducationResponseModel,
  EmployeeResponseModel,
  EmployeeWorkHistoryResponseModel,
} from '@app/core/api/models';
import { HumanResourceService } from '@app/core/api/services';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { linkDateRange, markFormDirty } from '@app/shared/utils';
import { AddressDialogComponent } from '@app/shared/dialogs/address-dialog/address-dialog.component';
import { EducationDialogComponent } from '@app/shared/dialogs/education-dialog/education-dialog.component';
import { WorkHistoryDialogComponent } from '@app/shared/dialogs/work-history-dialog/work-history-dialog.component';
import { PinCodeDialogComponent } from '../../dialogs/pin-code-dialog/pin-code-dialog.component';

const KEY_BTN_SAVE = 'save-profile';
const KEY_BTN_PIN = 'pin-profile';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  providers: [DialogService],
})
export class ProfileComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isSaving = signal(false);
  hasPinCode = signal(false);
  serverImageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  imageRemoved = signal(false);
  minEndDate = signal<Date | null>(null);

  addresses = signal<EmployeeAddressResponseModel[]>([]);
  educations = signal<EmployeeEducationResponseModel[]>([]);
  workHistories = signal<EmployeeWorkHistoryResponseModel[]>([]);

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly fb: FormBuilder,
    private readonly humanResourceService: HumanResourceService,
    private readonly modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_PIN,
      type: 'button',
      item: {
        key: KEY_BTN_PIN,
        label: this.hasPinCode() ? 'เปลี่ยน PIN' : 'ตั้งค่า PIN',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.onPinCodeDialog(),
      },
    });
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

  initForm(): void {
    this.form = this.fb.group({
      // Account
      username: ['', [Validators.required, Validators.maxLength(50)]],
      // Personal Info
      firstNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameThai: ['', [Validators.required, Validators.maxLength(100)]],
      firstNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      lastNameEnglish: ['', [Validators.required, Validators.maxLength(100)]],
      gender: [null as EGender | null, [Validators.required]],
      title: [null as ETitle | null, [Validators.required]],
      nickname: ['', [Validators.required, Validators.maxLength(50)]],
      nationalId: ['', [Validators.required, Validators.maxLength(13)]],
      nationality: [null as number | null, [Validators.required]],
      religion: [null as number | null, [Validators.required]],
      lineId: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: [null as Date | null, [Validators.required]],
      age: [{ value: '', disabled: true }],
      isActive: [true],
      // Employment
      positionId: [null as number | null, [Validators.required]],
      startDate: [null as Date | null, [Validators.required]],
      endDate: [null as Date | null],
      isFullTime: [true],
      salary: [null, [Validators.min(0)]],
      hourlyRate: [null, [Validators.min(0)]],
      bankName: ['', [Validators.maxLength(100)]],
      bankAccountNumber: ['', [Validators.maxLength(20)]],
      // Contact
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      // Meta
      imageUrl: [''],
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

  private loadProfile(): void {
    this.humanResourceService
      .humanResourceGetMyFullProfileGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const r = response.result as EmployeeResponseModel | undefined;
          if (r) {
            this.form.patchValue({
              username: r.username ?? '',
              firstNameThai: r.firstNameThai,
              lastNameThai: r.lastNameThai,
              firstNameEnglish: r.firstNameEnglish,
              lastNameEnglish: r.lastNameEnglish,
              gender: r.gender,
              positionId: r.positionId,
              startDate: r.startDate ? new Date(r.startDate) : null,
              title: r.title,
              nickname: r.nickname,
              email: r.email,
              phone: r.phone,
              nationalId: r.nationalId,
              nationality: r.nationality,
              religion: r.religion,
              lineId: r.lineId ?? '',
              dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth) : null,
              isFullTime: r.isFullTime ?? true,
              salary: r.salary,
              hourlyRate: r.hourlyRate,
              bankName: r.bankName,
              bankAccountNumber: r.bankAccountNumber,
              endDate: r.endDate ? new Date(r.endDate) : null,
              isActive: r.isActive,
            });

            if (r.imageFileId) {
              this.serverImageUrl.set(
                `${this.apiConfig.rootUrl}/api/admin/file/${r.imageFileId}`,
              );
            }

            if (r.dateOfBirth) {
              this.calculateAge(new Date(r.dateOfBirth));
            }

            this.addresses.set(r.addresses ?? []);
            this.educations.set(r.educations ?? []);
            this.workHistories.set(r.workHistories ?? []);

            this.hasPinCode.set(r.hasPinCode ?? false);
            this.updatePinButton();

            this.disableReadOnlyFields();
          }
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้',
          });
        },
      });
  }

  private disableReadOnlyFields(): void {
    const readOnlyFields = [
      'firstNameThai',
      'lastNameThai',
      'firstNameEnglish',
      'lastNameEnglish',
      'gender',
      'title',
      'nickname',
      'nationalId',
      'nationality',
      'religion',
      'dateOfBirth',
      'isActive',
      'positionId',
      'startDate',
      'isFullTime',
      'salary',
      'hourlyRate',
      'email',
    ];
    readOnlyFields.forEach((field) => this.form.get(field)?.disable());
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

    const f = this.form.getRawValue();

    this.humanResourceService
      .humanResourceUpdateMyProfilePut({
        body: {
          Username: f.username,
          LineId: f.lineId,
          BankName: f.bankName,
          BankAccountNumber: f.bankAccountNumber,
          EndDate: f.endDate ? (f.endDate as Date).toISOString() : undefined,
          Phone: f.phone,
          RemoveImage: this.imageRemoved(),
          imageFile: this.selectedFile() ?? undefined,
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
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          // Reload profile to get fresh data
          this.loadProfile();
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถบันทึกโปรไฟล์ได้',
          });
          this.resetSavingState();
        },
      });
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
  }

  private updatePinButton(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_PIN,
      type: 'button',
      item: {
        key: KEY_BTN_PIN,
        label: this.hasPinCode() ? 'เปลี่ยน PIN' : 'ตั้งค่า PIN',
        severity: 'secondary',
        callback: () => this.onPinCodeDialog(),
      },
    });
  }

  onPinCodeDialog(): void {
    const hasPin = this.hasPinCode();
    const ref = this.dialogService.open(PinCodeDialogComponent, {
      header: hasPin ? 'เปลี่ยนรหัส PIN' : 'ตั้งค่ารหัส PIN',
      width: '30vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { hasPinCode: hasPin },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === true) {
          this.loadProfile();
        }
      });
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
