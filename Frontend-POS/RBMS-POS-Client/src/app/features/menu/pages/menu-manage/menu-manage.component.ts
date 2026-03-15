import { Component, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EMenuCategory } from '@app/core/api/models';
import { MenusService } from '@app/core/api/services';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';

import { markFormDirty } from '@app/shared/utils';

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
  isSaving = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiConfig: ApiConfiguration,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly menusService: MenusService,
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
    this.menusService
      .menusGetByIdGet({ menuId: id })
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
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลเมนูได้' });
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.modalService.cancel({ title: 'ผิดพลาด !', message: 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง' });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ขนาดรูปภาพต้องไม่เกิน 5MB' });
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
      markFormDirty(this.form);
      return;
    }

    this.isSaving.set(true);
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, true);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, true);

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
      .menusCreatePost({ body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/items']);
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถเพิ่มเมนูได้' });
          this.resetSavingState();
        },
      });
  }

  private updateMenu(body: Record<string, unknown>): void {
    const menuId = this.menuId()!;

    this.menusService
      .menusUpdatePut({ menuId, body: body as any })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetSavingState();
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/items']);
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถแก้ไขข้อมูลเมนูได้' });
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

}
