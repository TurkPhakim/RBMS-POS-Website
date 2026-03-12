import { Component, signal, DestroyRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenusService } from '@app/core/api/services';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EMenuCategory } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_SAVE = 'save-menu';
const KEY_BTN_BACK = 'back';

@Component({
  selector: 'app-menu-manage',
  standalone: false,
  templateUrl: './menu-manage.component.html',
})
export class MenuManageComponent implements OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  menuId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  categoryOptions = [
    { value: 1 as EMenuCategory, label: 'อาหาร' },
    { value: 2 as EMenuCategory, label: 'เครื่องดื่ม' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly menusService: MenusService,
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
        label: this.isEditMode() ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู',
        icon: 'pi pi-check',
        callback: () => this.onSubmit(),
      },
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      nameThai: ['', [Validators.required, Validators.maxLength(200)]],
      nameEnglish: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      imageUrl: [''],
      price: [null, [Validators.required, Validators.min(0), Validators.max(99999999.99)]],
      category: [1 as EMenuCategory, [Validators.required]],
      isActive: [true],
      isAvailable: [true],
    });
  }

  checkEditMode(): void {
    const menuId = this.route.snapshot.paramMap.get('menuId');
    if (menuId) {
      this.isEditMode.set(true);
      this.menuId.set(+menuId);
      this.loadMenu(+menuId);
    }
  }

  loadMenu(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.menusService
      .apiMenuMenuIdGet({ menuId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.result) {
            this.form.patchValue({
              nameThai: response.result.nameThai,
              nameEnglish: response.result.nameEnglish,
              description: response.result.description,
              price: response.result.price,
              category: response.result.category,
              isActive: response.result.isActive,
              isAvailable: response.result.isAvailable,
            });

            if (response.result.imageFileId) {
              this.imagePreview.set(
                `${this.apiConfig.rootUrl}/api/admin/file/${response.result.imageFileId}`
              );
            }
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลเมนูได้');
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
      NameThai: f.nameThai as string,
      NameEnglish: f.nameEnglish as string,
      Description: f.description as string | undefined,
      Price: f.price as number,
      Category: f.category as EMenuCategory,
      IsActive: f.isActive as boolean | undefined,
      IsAvailable: f.isAvailable as boolean | undefined,
      imageFile: this.selectedFile() as Blob | undefined,
    };

    if (this.isEditMode()) {
      this.updateMenu(body);
    } else {
      this.createMenu(body);
    }
  }

  private createMenu(body: Record<string, unknown>): void {
    this.menusService
      .apiMenuPost({ body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(`เพิ่มเมนู "${this.form.value.nameThai}" สำเร็จ`);
          this.showSuccessModal.set(true);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถเพิ่มเมนูได้');
          this.showErrorModal.set(true);
          this.resetSavingState();
        },
      });
  }

  private updateMenu(body: Record<string, unknown>): void {
    const menuId = this.menuId()!;

    this.menusService
      .apiMenuMenuIdPut({ menuId, body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.successMessage.set(`แก้ไขเมนู "${this.form.value.nameThai}" สำเร็จ`);
          this.showSuccessModal.set(true);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถแก้ไขข้อมูลเมนูได้');
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
    this.router.navigate(['/menu/items']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/menu/items']);
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
    if (field.errors['maxlength'])
      return `ห้ามเกิน ${field.errors['maxlength'].requiredLength} ตัวอักษร`;
    if (field.errors['min'])
      return `ค่าต้องไม่น้อยกว่า ${field.errors['min'].min}`;
    if (field.errors['max'])
      return `ค่าต้องไม่เกิน ${field.errors['max'].max}`;

    return '';
  }
}
