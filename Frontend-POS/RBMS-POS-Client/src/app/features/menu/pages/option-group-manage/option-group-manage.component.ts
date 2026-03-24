import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOptionsService } from '@app/core/api/services/menu-options.service';
import { OptionGroupResponseModel } from '@app/core/api/models/option-group-response-model';
import { OptionItemRequestModel } from '@app/core/api/models/option-item-request-model';
import { LinkedMenuModel } from '@app/core/api/models/linked-menu-model';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

const KEY_BTN_BACK = 'back-option-group';
const KEY_BTN_SAVE = 'save-option-group';

@Component({
  selector: 'app-option-group-manage',
  standalone: false,
  templateUrl: './option-group-manage.component.html',
})
export class OptionGroupManageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = signal(false);
  optionGroupId = signal<number | null>(null);
  optionGroupData = signal<OptionGroupResponseModel | null>(null);
  categoryType = signal(1);
  optionItems = signal<OptionItemForm[]>([]);
  linkedMenus = signal<LinkedMenuModel[]>([]);
  hasMaxLimit = signal(false);
  hasItemError = signal(false);

  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly menuOptionsService: MenuOptionsService,
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('menu-option.update');
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

    const items = this.optionItems();
    if (items.length === 0) {
      this.hasItemError.set(true);
      return;
    }

    const hasEmptyName = items.some((i) => !i.name.trim());
    if (hasEmptyName) {
      this.hasItemError.set(true);
      return;
    }

    this.hasItemError.set(false);
    this.setSavingState(true);

    if (this.isEditMode()) {
      this.updateOptionGroup();
    } else {
      this.createOptionGroup();
    }
  }

  addItem(): void {
    const items = [...this.optionItems()];
    items.push({
      optionItemId: null,
      name: '',
      additionalPrice: null,
      costPrice: null,
      isActive: true,
    });
    this.optionItems.set(items);
    this.hasItemError.set(false);
  }

  removeItem(index: number): void {
    const items = [...this.optionItems()];
    items.splice(index, 1);
    this.optionItems.set(items);
  }

  onItemDrop(event: CdkDragDrop<OptionItemForm[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const items = [...this.optionItems()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.optionItems.set(items);
  }

  getImageUrl(fileId: number | null | undefined): string | null {
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  }

  onHasMaxLimitChange(checked: boolean): void {
    this.hasMaxLimit.set(checked);
    if (checked) {
      this.form.get('maxSelect')?.enable();
      this.form.get('maxSelect')?.setValue(1);
    } else {
      this.form.get('maxSelect')?.setValue(null);
      this.form.get('maxSelect')?.disable();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      categoryType: [null, Validators.required],
      isRequired: [false],
      minSelect: [0],
      maxSelect: [{ value: null, disabled: true }],
      isActive: [true],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('optionGroupId');
    if (id) {
      this.isEditMode.set(true);
      this.optionGroupId.set(+id);
      this.loadOptionGroup(+id);
    } else {
      const ct = this.route.snapshot.queryParamMap.get('categoryType');
      if (ct) {
        this.categoryType.set(+ct);
        this.form.get('categoryType')?.setValue(+ct);
      }
    }
  }

  private loadOptionGroup(id: number): void {
    this.menuOptionsService
      .menuOptionsGetOptionGroupGet({ optionGroupId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.result!;
          this.optionGroupData.set(data);
          this.categoryType.set(data.categoryType ?? 1);
          this.linkedMenus.set(data.linkedMenus ?? []);

          this.form.patchValue({
            name: data.name,
            categoryType: data.categoryType,
            isRequired: data.isRequired,
            minSelect: data.minSelect,
            maxSelect: data.maxSelect,
            isActive: data.isActive,
          });

          if (data.maxSelect != null) {
            this.hasMaxLimit.set(true);
            this.form.get('maxSelect')?.enable();
          } else {
            this.hasMaxLimit.set(false);
            this.form.get('maxSelect')?.disable();
          }

          const items: OptionItemForm[] = (data.optionItems ?? []).map((oi) => ({
            optionItemId: oi.optionItemId ?? null,
            name: oi.name ?? '',
            additionalPrice: oi.additionalPrice ?? 0,
            costPrice: oi.costPrice ?? null,
            isActive: oi.isActive ?? true,
          }));
          this.optionItems.set(items);

          if (!this.canUpdate) this.form.disable();
        },
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถโหลดข้อมูลได้' });
          this.router.navigate(['/menu/options']);
        },
      });
  }

  private buildOptionItems(): OptionItemRequestModel[] {
    return this.optionItems().map((item, index) => ({
      optionItemId: item.optionItemId,
      name: item.name,
      additionalPrice: item.additionalPrice ?? 0,
      costPrice: item.costPrice,
      isActive: item.isActive,
      sortOrder: index,
    }));
  }

  private createOptionGroup(): void {
    const formVal = this.form.getRawValue();
    this.menuOptionsService
      .menuOptionsCreateOptionGroupPost({
        body: {
          name: formVal.name,
          categoryType: formVal.categoryType,
          isRequired: formVal.isRequired,
          minSelect: formVal.isRequired ? formVal.minSelect : 0,
          maxSelect: formVal.maxSelect,
          isActive: formVal.isActive,
          optionItems: this.buildOptionItems(),
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/options']);
        },
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถสร้างกลุ่มตัวเลือกได้' });
          this.resetSavingState();
        },
      });
  }

  private updateOptionGroup(): void {
    const formVal = this.form.getRawValue();
    this.menuOptionsService
      .menuOptionsUpdateOptionGroupPut({
        optionGroupId: this.optionGroupId()!,
        body: {
          name: formVal.name,
          isRequired: formVal.isRequired,
          minSelect: formVal.isRequired ? formVal.minSelect : 0,
          maxSelect: formVal.maxSelect,
          isActive: formVal.isActive,
          optionItems: this.buildOptionItems(),
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.router.navigate(['/menu/options']);
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
        callback: () => this.router.navigate(['/menu/options']),
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

interface OptionItemForm {
  optionItemId: number | null;
  name: string;
  additionalPrice: number | null;
  costPrice: number | null;
  isActive: boolean;
}
