import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { merge } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItemsService } from '@app/core/api/services/menu-items.service';
import { ShopSettingsService } from '@app/core/api/services/shop-settings.service';
import { MenuResponseModel } from '@app/core/api/models/menu-response-model';
import { MenuOptionGroupResponseModel } from '@app/core/api/models/menu-option-group-response-model';
import { OptionGroupResponseModel } from '@app/core/api/models/option-group-response-model';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';
import { SelectOptionGroupDialogComponent } from '../../dialogs/select-option-group-dialog/select-option-group-dialog.component';

const KEY_BTN_BACK = 'back-menu';
const KEY_BTN_SAVE = 'save-menu';

const CATEGORY_CONFIG: Record<number, { title: string; icon: string; basePath: string; permissionPrefix: string }> = {
  1: { title: 'เมนูอาหาร', icon: 'food', basePath: '/menu/food', permissionPrefix: 'menu-food' },
  2: { title: 'เมนูเครื่องดื่ม', icon: 'drinks-glass', basePath: '/menu/beverage', permissionPrefix: 'menu-beverage' },
  3: { title: 'เมนูของหวาน', icon: 'dessert', basePath: '/menu/dessert', permissionPrefix: 'menu-dessert' },
};

@Component({
  selector: 'app-menu-manage',
  standalone: false,
  templateUrl: './menu-manage.component.html',
  providers: [DialogService],
})
export class MenuManageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  menuId = signal<number | null>(null);
  menuData = signal<MenuResponseModel | null>(null);
  categoryType = 1;
  config = CATEGORY_CONFIG[1];

  serverImageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  imageRemoved = signal(false);

  hasTwoPeriods = signal(false);
  linkedOptionGroups = signal<MenuOptionGroupResponseModel[]>([]);

  tagRecommended = signal(false);
  tagSeasonal = signal(false);
  tagSlow = signal(false);

  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly menuItemsService: MenuItemsService,
    private readonly shopSettingsService: ShopSettingsService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly apiConfig: ApiConfiguration,
    private readonly destroyRef: DestroyRef,
  ) {
    // Permission จะ resolve ใน ngOnInit หลังได้ categoryType
    this.canUpdate = false;
  }

  ngOnInit(): void {
    this.categoryType = this.route.parent?.snapshot.data['categoryType'] ?? 1;
    this.config = CATEGORY_CONFIG[this.categoryType] ?? CATEGORY_CONFIG[1];
    this.canUpdate = this.authService.hasPermission(`${this.config.permissionPrefix}.update`);
    this.initForm();
    this.setupPeriodAutoClose();
    this.loadShopSettings();
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
      this.updateMenu();
    } else {
      this.createMenu();
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.imageRemoved.set(false);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imageRemoved.set(true);
  }

  onTagToggle(tag: 'recommended' | 'seasonal' | 'slow'): void {
    if (tag === 'recommended') this.tagRecommended.update((v) => !v);
    if (tag === 'seasonal') this.tagSeasonal.update((v) => !v);
    if (tag === 'slow') this.tagSlow.update((v) => !v);
  }

  openSelectOptionGroupDialog(): void {
    const excludeIds = this.linkedOptionGroups().map((g) => g.optionGroupId!);
    const ref = this.dialogService.open(SelectOptionGroupDialogComponent, {
      header: 'เลือกตัวเลือกเสริม',
      width: '50vw',
      styleClass: 'card-dialog',
      showHeader: false,
      modal: true,
      data: {
        categoryType: this.categoryType,
        excludeIds,
      },
    });

    ref.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (selected: OptionGroupResponseModel[] | undefined) => {
        if (!selected?.length) return;
        const current = [...this.linkedOptionGroups()];
        for (const group of selected) {
          current.push({
            optionGroupId: group.optionGroupId,
            name: group.name,
            isRequired: group.isRequired,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,
            optionItems: (group.optionItems ?? []).map((oi) => ({
              name: oi.name,
              additionalPrice: oi.additionalPrice,
            })),
          });
        }
        this.linkedOptionGroups.set(current);
      },
    });
  }

  onOptionGroupDrop(event: CdkDragDrop<MenuOptionGroupResponseModel[]>): void {
    const items = [...this.linkedOptionGroups()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.linkedOptionGroups.set(items);
  }

  removeOptionGroup(index: number): void {
    const items = [...this.linkedOptionGroups()];
    items.splice(index, 1);
    this.linkedOptionGroups.set(items);
  }

  private initForm(): void {
    this.form = this.fb.group({
      nameThai: ['', Validators.required],
      nameEnglish: ['', Validators.required],
      description: [''],
      subCategoryId: [null, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      costPrice: [null],
      isAvailablePeriod1: [true],
      isAvailablePeriod2: [true],
      allergens: [''],
      caloriesPerServing: [null],
      isAvailable: [true],
      isPinned: [false],
    });
  }

  private setupPeriodAutoClose(): void {
    merge(
      this.form.get('isAvailablePeriod1')!.valueChanges,
      this.form.get('isAvailablePeriod2')!.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.hasTwoPeriods()) return;
        const p1 = this.form.get('isAvailablePeriod1')!.value;
        const p2 = this.form.get('isAvailablePeriod2')!.value;
        if (!p1 && !p2) {
          this.form.get('isAvailable')!.setValue(false);
        }
      });
  }

  private loadShopSettings(): void {
    this.shopSettingsService
      .shopSettingsGetGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.hasTwoPeriods.set(res.result?.hasTwoPeriods ?? false);
        },
      });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('menuId');
    if (id) {
      this.isEditMode.set(true);
      this.menuId.set(+id);
      this.loadMenu(+id);
    }
  }

  private loadMenu(id: number): void {
    this.menuItemsService
      .menuItemsGetMenuGet({ menuId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.result!;
          this.menuData.set(data);
          this.linkedOptionGroups.set(data.optionGroups ?? []);

          if (data.imageFileId) {
            this.serverImageUrl.set(
              `${this.apiConfig.rootUrl}/api/admin/file/${data.imageFileId}`,
            );
          }

          const tags = data.tags ?? 0;
          this.tagRecommended.set(!!(tags & 1));
          this.tagSeasonal.set(!!(tags & 2));
          this.tagSlow.set(!!(tags & 4));

          this.form.patchValue({
            nameThai: data.nameThai,
            nameEnglish: data.nameEnglish,
            description: data.description,
            subCategoryId: data.subCategoryId,
            price: data.price,
            costPrice: data.costPrice,
            isAvailablePeriod1: data.isAvailablePeriod1,
            isAvailablePeriod2: data.isAvailablePeriod2,
            allergens: data.allergens,
            caloriesPerServing: data.caloriesPerServing,
            isAvailable: data.isAvailable,
            isPinned: data.isPinned,
          });

          if (!this.canUpdate) this.form.disable();
        },
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถโหลดข้อมูลได้' });
          this.router.navigate([this.config.basePath]);
        },
      });
  }

  private buildTags(): number {
    return (this.tagRecommended() ? 1 : 0) | (this.tagSeasonal() ? 2 : 0) | (this.tagSlow() ? 4 : 0);
  }

  private buildBody(): Record<string, unknown> {
    const f = this.form.getRawValue();
    return {
      NameThai: f.nameThai,
      NameEnglish: f.nameEnglish,
      Description: f.description || undefined,
      SubCategoryId: f.subCategoryId,
      Price: f.price,
      CostPrice: f.costPrice ?? undefined,
      IsAvailablePeriod1: f.isAvailablePeriod1,
      IsAvailablePeriod2: f.isAvailablePeriod2,
      Tags: this.buildTags(),
      Allergens: f.allergens || undefined,
      CaloriesPerServing: f.caloriesPerServing ?? undefined,
      IsAvailable: f.isAvailable,
      IsPinned: f.isPinned,
      OptionGroupIds: this.linkedOptionGroups().map((g) => g.optionGroupId!),
      imageFile: this.selectedFile() as Blob | undefined,
    };
  }

  private createMenu(): void {
    this.menuItemsService
      .menuItemsCreateMenuPost({
        body: this.buildBody() as any,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate([this.config.basePath]);
        },
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถสร้างเมนูได้' });
          this.resetSavingState();
        },
      });
  }

  private updateMenu(): void {
    const body = this.buildBody() as any;
    body.RemoveImage = this.imageRemoved();

    this.menuItemsService
      .menuItemsUpdateMenuPut({
        menuId: this.menuId()!,
        body,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate([this.config.basePath]);
        },
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกข้อมูลได้' });
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
        callback: () => this.router.navigate([this.config.basePath]),
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
