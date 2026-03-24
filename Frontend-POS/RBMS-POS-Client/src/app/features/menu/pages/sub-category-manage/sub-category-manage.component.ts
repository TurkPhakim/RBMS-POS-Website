import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuCategoriesService } from '@app/core/api/services/menu-categories.service';
import { MenuItemsService } from '@app/core/api/services/menu-items.service';
import { MenuSubCategoryResponseModel } from '@app/core/api/models/menu-sub-category-response-model';
import { MenuResponseModel } from '@app/core/api/models/menu-response-model';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';
const KEY_BTN_BACK = 'back-sub-category';
const KEY_BTN_SAVE = 'save-sub-category';

@Component({
  selector: 'app-sub-category-manage',
  standalone: false,
  templateUrl: './sub-category-manage.component.html',
})
export class SubCategoryManageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  subCategoryId = signal<number | null>(null);
  subCategoryData = signal<MenuSubCategoryResponseModel | null>(null);
  categoryType = signal(1);
  menus = signal<MenuResponseModel[]>([]);

  canUpdate: boolean;

  readonly categoryLabel = () =>
    CATEGORY_LABELS[this.categoryType()] ?? 'ไม่ระบุ';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly menuCategoriesService: MenuCategoriesService,
    private readonly menuItemsService: MenuItemsService,
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('menu-category.update');
  }

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.setSavingState(true);

    if (this.isEditMode()) {
      this.updateSubCategory();
    } else {
      this.createSubCategory();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      isActive: [true],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('subCategoryId');
    if (id) {
      this.isEditMode.set(true);
      this.subCategoryId.set(+id);
      this.loadSubCategory(+id);
    } else {
      const ct = this.route.snapshot.queryParamMap.get('categoryType');
      if (ct) this.categoryType.set(+ct);
    }
  }

  private loadSubCategory(id: number): void {
    this.menuCategoriesService
      .menuCategoriesGetSubCategoryGet({ subCategoryId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.result!;
          this.subCategoryData.set(data);
          this.categoryType.set(data.categoryType ?? 1);
          this.form.patchValue({
            name: data.name,
            isActive: data.isActive,
          });
          if (!this.canUpdate) this.form.disable();
          this.loadMenus(id);
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          });
          this.router.navigate(['/menu/categories'], {
            queryParams: { tab: this.categoryType() },
          });
        },
      });
  }

  getImageUrl(fileId: number | null | undefined): string | null {
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  }

  getPeriodLabel(item: MenuResponseModel): { text: string; severity: string } {
    const p1 = item.isAvailablePeriod1 ?? false;
    const p2 = item.isAvailablePeriod2 ?? false;
    if (p1 && p2) return { text: 'ทั้งวัน', severity: 'success' };
    if (p1) return { text: 'ช่วง 1', severity: 'info' };
    if (p2) return { text: 'ช่วง 2', severity: 'info' };
    return { text: 'ปิด', severity: 'danger' };
  }

  private loadMenus(subCategoryId: number): void {
    this.menuItemsService
      .menuItemsGetMenusGet({ subCategoryId, ItemPerPage: 999 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.menus.set(res.results ?? []),
      });
  }

  private createSubCategory(): void {
    this.menuCategoriesService
      .menuCategoriesCreateSubCategoryPost({
        body: {
          categoryType: this.categoryType(),
          name: this.form.value.name,
          isActive: this.form.value.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/categories'], {
            queryParams: { tab: this.categoryType() },
          });
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถสร้างหมวดหมู่ได้',
          });
          this.resetSavingState();
        },
      });
  }

  private updateSubCategory(): void {
    this.menuCategoriesService
      .menuCategoriesUpdateSubCategoryPut({
        subCategoryId: this.subCategoryId()!,
        body: {
          name: this.form.value.name,
          isActive: this.form.value.isActive,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/categories'], {
            queryParams: { tab: this.categoryType() },
          });
        },
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถบันทึกข้อมูลได้',
          });
          this.resetSavingState();
        },
      });
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
        callback: () =>
          this.router.navigate(['/menu/categories'], {
            queryParams: { tab: this.categoryType() },
          }),
      },
    });

    const showSave = this.isEditMode() ? this.canUpdate : true;
    if (showSave) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_SAVE,
        type: 'button',
        item: {
          key: KEY_BTN_SAVE,
          label: 'บันทึก',
          severity: 'primary',
          callback: () => this.onSubmit(),
        },
      });
    }
  }

  private setSavingState(saving: boolean): void {
    this.breadcrumbService.setButtonLoading(KEY_BTN_SAVE, saving);
    this.breadcrumbService.setButtonDisabled(KEY_BTN_BACK, saving);
  }

  private resetSavingState(): void {
    this.setSavingState(false);
  }
}

const CATEGORY_LABELS: Record<number, string> = {
  1: 'อาหาร',
  2: 'เครื่องดื่ม',
  3: 'ของหวาน',
};
