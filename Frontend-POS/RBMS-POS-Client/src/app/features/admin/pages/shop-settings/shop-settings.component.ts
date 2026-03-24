import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { ShopSettingsResponseModel } from '@app/core/api/models';
import { ShopSettingsService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';
import { DAY_LABELS } from '@app/shared/component-interfaces';
import { markFormDirty } from '@app/shared/utils';
const KEY_BTN_SAVE = 'save-shop-settings';

@Component({
  selector: 'app-shop-settings',
  standalone: false,
  templateUrl: './shop-settings.component.html',
})
export class ShopSettingsComponent implements OnDestroy {
  form!: FormGroup;
  isSaving = signal(false);
  serverLogoUrl = signal<string | null>(null);
  qrCodePreview = signal<string | null>(null);
  selectedLogoFile = signal<File | null>(null);
  selectedQrCodeFile = signal<File | null>(null);
  logoRemoved = signal(false);
  qrCodeRemoved = signal(false);
  settings = signal<ShopSettingsResponseModel | null>(null);

  readonly dayLabels = DAY_LABELS;
  canUpdate: boolean;

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly brandingService: ShopBrandingService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly shopSettingsService: ShopSettingsService,
  ) {
    this.canUpdate = this.authService.hasPermission('shop-settings.update');
  }

  ngOnInit(): void {
    this.initForm();
    this.setupOperatingHoursToggle();
    this.setupBreadcrumbButtons();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  get operatingHours(): FormArray {
    return this.form.get('operatingHours') as FormArray;
  }

  private initForm(): void {
    this.form = this.fb.group({
      shopNameThai: ['', [Validators.required, Validators.maxLength(200)]],
      shopNameEnglish: ['', [Validators.required, Validators.maxLength(200)]],
      companyNameThai: ['', [Validators.maxLength(200)]],
      companyNameEnglish: ['', [Validators.maxLength(200)]],
      taxId: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
      foodType: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      hasTwoPeriods: [false],
      receiptHeaderText: ['', [Validators.maxLength(1000)]],
      receiptFooterText: ['', [Validators.maxLength(1000)]],
      address: ['', [Validators.required, Validators.maxLength(2000)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(50)]],
      shopEmail: ['', [Validators.maxLength(200), Validators.email]],
      facebook: ['', [Validators.maxLength(200)]],
      instagram: ['', [Validators.maxLength(200)]],
      website: ['', [Validators.maxLength(500)]],
      lineId: ['', [Validators.maxLength(100)]],
      bankName: ['', [Validators.maxLength(200)]],
      accountNumber: ['', [Validators.maxLength(50)]],
      accountName: ['', [Validators.maxLength(200)]],
      wifiSsid: ['', [Validators.maxLength(100)]],
      wifiPassword: ['', [Validators.maxLength(200)]],
      operatingHours: this.fb.array(
        Array.from({ length: 7 }, (_, i) =>
          this.createOperatingHourGroup(i + 1),
        ),
      ),
    });

    if (!this.canUpdate) {
      this.form.disable();
    }
  }

  private createOperatingHourGroup(dayOfWeek: number): FormGroup {
    return this.fb.group({
      shopOperatingHourId: [0],
      dayOfWeek: [dayOfWeek],
      isOpen: [false],
      openTime1: [''],
      closeTime1: [''],
      openTime2: [''],
      closeTime2: [''],
    });
  }

  private setupOperatingHoursToggle(): void {
    if (!this.canUpdate) return; // form disabled แล้ว ไม่ต้อง toggle
    const timeFields = ['openTime1', 'closeTime1', 'openTime2', 'closeTime2'];
    this.operatingHours.controls.forEach((group) => {
      const isOpen = group.get('isOpen')!;
      const toggle = (open: boolean) => {
        timeFields.forEach((f) => {
          const ctrl = group.get(f)!;
          open ? ctrl.enable() : ctrl.disable();
        });
      };
      toggle(isOpen.value);
      isOpen.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(toggle);
    });
  }

  private setupBreadcrumbButtons(): void {
    if (this.canUpdate) {
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

  private loadSettings(): void {
    this.shopSettingsService
      .shopSettingsGetGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.settings.set(response.result);
            this.patchForm(response.result);
          }
        },
        error: () => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: 'ไม่สามารถโหลดข้อมูลตั้งค่าร้านค้าได้',
          });
        },
      });
  }

  private patchForm(data: ShopSettingsResponseModel): void {
    this.form.patchValue({
      shopNameThai: data.shopNameThai ?? '',
      shopNameEnglish: data.shopNameEnglish ?? '',
      companyNameThai: data.companyNameThai ?? '',
      companyNameEnglish: data.companyNameEnglish ?? '',
      taxId: data.taxId ?? '',
      foodType: data.foodType ?? '',
      description: data.description ?? '',
      hasTwoPeriods: data.hasTwoPeriods ?? false,
      receiptHeaderText: data.receiptHeaderText ?? '',
      receiptFooterText: data.receiptFooterText ?? '',
      address: data.address ?? '',
      phoneNumber: data.phoneNumber ?? '',
      shopEmail: data.shopEmail ?? '',
      facebook: data.facebook ?? '',
      instagram: data.instagram ?? '',
      website: data.website ?? '',
      lineId: data.lineId ?? '',
      bankName: data.bankName ?? '',
      accountNumber: data.accountNumber ?? '',
      accountName: data.accountName ?? '',
      wifiSsid: data.wifiSsid ?? '',
      wifiPassword: data.wifiPassword ?? '',
    });

    if (data.operatingHours) {
      data.operatingHours.forEach((oh, index) => {
        if (index < this.operatingHours.length) {
          this.operatingHours.at(index).patchValue({
            shopOperatingHourId: oh.shopOperatingHourId ?? 0,
            dayOfWeek: oh.dayOfWeek,
            isOpen: oh.isOpen ?? false,
            openTime1: this.timeStringToDate(oh.openTime1),
            closeTime1: this.timeStringToDate(oh.closeTime1),
            openTime2: this.timeStringToDate(oh.openTime2),
            closeTime2: this.timeStringToDate(oh.closeTime2),
          });
        }
      });
    }

    if (data.logoFileId) {
      this.serverLogoUrl.set(
        `${this.apiConfig.rootUrl}/api/admin/file/${data.logoFileId}`,
      );
    }

    if (data.paymentQrCodeFileId) {
      this.qrCodePreview.set(
        `${this.apiConfig.rootUrl}/api/admin/file/${data.paymentQrCodeFileId}`,
      );
    }
  }

  onLogoRemoved(): void {
    this.selectedLogoFile.set(null);
    this.logoRemoved.set(true);
  }

  onQrCodeRemoved(): void {
    this.selectedQrCodeFile.set(null);
    this.qrCodeRemoved.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    const f = this.form.value;

    // ใช้ flattened format (OperatingHours[i].Prop) เพราะ RequestBuilder serialize
    // array of objects เป็น JSON Blob ซึ่ง ASP.NET Core [FromForm] binding ไม่รองรับ
    // จึงต้องใช้ as any เพราะ body shape ไม่ตรงกับ generated type
    const body: Record<string, unknown> = {
      ShopNameThai: f.shopNameThai,
      ShopNameEnglish: f.shopNameEnglish,
      TaxId: f.taxId,
      FoodType: f.foodType,
      HasTwoPeriods: f.hasTwoPeriods,
      Address: f.address,
      PhoneNumber: f.phoneNumber,
    };

    if (f.companyNameThai) body['CompanyNameThai'] = f.companyNameThai;
    if (f.companyNameEnglish) body['CompanyNameEnglish'] = f.companyNameEnglish;
    if (f.description) body['Description'] = f.description;
    if (f.receiptHeaderText) body['ReceiptHeaderText'] = f.receiptHeaderText;
    if (f.receiptFooterText) body['ReceiptFooterText'] = f.receiptFooterText;
    if (f.shopEmail) body['ShopEmail'] = f.shopEmail;
    if (f.facebook) body['Facebook'] = f.facebook;
    if (f.instagram) body['Instagram'] = f.instagram;
    if (f.website) body['Website'] = f.website;
    if (f.lineId) body['LineId'] = f.lineId;
    if (f.bankName) body['BankName'] = f.bankName;
    if (f.accountNumber) body['AccountNumber'] = f.accountNumber;
    if (f.accountName) body['AccountName'] = f.accountName;
    if (f.wifiSsid) body['WifiSsid'] = f.wifiSsid;
    if (f.wifiPassword) body['WifiPassword'] = f.wifiPassword;

    const hours = f.operatingHours as Array<Record<string, unknown>>;
    hours.forEach((h, i) => {
      body[`OperatingHours[${i}].DayOfWeek`] = h['dayOfWeek'];
      body[`OperatingHours[${i}].IsOpen`] = h['isOpen'];
      const open1 = this.dateToTimeString(
        h['openTime1'] as Date | string | null,
      );
      const close1 = this.dateToTimeString(
        h['closeTime1'] as Date | string | null,
      );
      const open2 = this.dateToTimeString(
        h['openTime2'] as Date | string | null,
      );
      const close2 = this.dateToTimeString(
        h['closeTime2'] as Date | string | null,
      );
      if (open1) body[`OperatingHours[${i}].OpenTime1`] = open1;
      if (close1) body[`OperatingHours[${i}].CloseTime1`] = close1;
      if (open2) body[`OperatingHours[${i}].OpenTime2`] = open2;
      if (close2) body[`OperatingHours[${i}].CloseTime2`] = close2;
    });

    if (this.selectedLogoFile()) body['logoFile'] = this.selectedLogoFile();
    if (this.selectedQrCodeFile())
      body['paymentQrCodeFile'] = this.selectedQrCodeFile();
    if (this.logoRemoved()) body['RemoveLogo'] = true;
    if (this.qrCodeRemoved()) body['RemoveQrCode'] = true;

    this.shopSettingsService
      .shopSettingsUpdatePut({ body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.resetSavingState();
          if (response.result) {
            this.settings.set(response.result);
            this.patchForm(response.result);
          }
          this.brandingService.refresh();
          this.modalService.commonSuccess();
        },
        error: (error) => {
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: error.error?.message || 'ไม่สามารถบันทึกข้อมูลได้',
          });
          this.resetSavingState();
        },
      });
  }

  private resetSavingState(): void {
    this.isSaving.set(false);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, false);
  }

  private timeStringToDate(time: string | null | undefined): Date | null {
    if (!time) return null;
    const parts = time.split(':');
    if (parts.length < 2) return null;
    const d = new Date();
    d.setHours(+parts[0], +parts[1], 0, 0);
    return d;
  }

  private dateToTimeString(value: Date | string | null | undefined): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
