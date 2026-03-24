import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuCategoriesService } from '@app/core/api/services/menu-categories.service';
import { MenuSubCategoryResponseModel } from '@app/core/api/models/menu-sub-category-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-sub-category';

const TAB_CONFIG = [
  { label: 'อาหาร', icon: 'food', categoryType: 1, addLabel: 'เพิ่มหมวดหมู่อาหาร' },
  { label: 'เครื่องดื่ม', icon: 'drinks-glass', categoryType: 2, addLabel: 'เพิ่มหมวดหมู่เครื่องดื่ม' },
  { label: 'ของหวาน', icon: 'dessert', categoryType: 3, addLabel: 'เพิ่มหมวดหมู่ของหวาน' },
];

@Component({
  selector: 'app-sub-category-list',
  standalone: false,
  templateUrl: './sub-category-list.component.html',
})
export class SubCategoryListComponent implements OnInit, OnDestroy {
  subCategories = signal<MenuSubCategoryResponseModel[]>([]);
  activeTabIndex = signal(0);
  searchTerm = signal('');

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  readonly tabs = TAB_CONFIG;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly menuCategoriesService: MenuCategoriesService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = this.authService.hasPermission('menu-category.create');
    this.canUpdate = this.authService.hasPermission('menu-category.update');
    this.canDelete = this.authService.hasPermission('menu-category.delete');
  }

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab) {
      const index = this.tabs.findIndex((t) => t.categoryType === +tab);
      if (index >= 0) this.activeTabIndex.set(index);
    }
    this.loadSubCategories();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    this.searchTerm.set('');
    this.loadSubCategories();
    this.updateAddButtonLabel();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.loadSubCategories();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchTerm.set('');
    this.loadSubCategories();
  }

  onEdit(subCategoryId: number): void {
    this.router.navigate(['/menu/categories/update', subCategoryId]);
  }

  onDelete(subCategoryId: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบหมวดหมู่ "${name}" หรือไม่?`,
      onConfirm: () => {
        this.menuCategoriesService
          .menuCategoriesDeleteSubCategoryDelete({ subCategoryId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadSubCategories();
            },
            error: () => this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลบหมวดหมู่ได้' }),
          });
      },
    });
  }

  onRowReorder(): void {
    const items = this.subCategories();

    // Separate Active and Inactive, keep relative order
    const activeItems = items.filter((i) => i.isActive);
    const inactiveItems = items.filter((i) => !i.isActive);

    // Re-sort: Active first, then Inactive
    this.subCategories.set([...activeItems, ...inactiveItems]);

    // Save sort order for Active items only
    const sortItems = activeItems.map((item, index) => ({
      id: item.subCategoryId!,
      sortOrder: index,
    }));

    this.menuCategoriesService
      .menuCategoriesUpdateSortOrderPut({ body: { items: sortItems } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถบันทึกลำดับได้' });
          this.loadSubCategories();
        },
      });
  }

  private get activeCategoryType(): number {
    return this.tabs[this.activeTabIndex()].categoryType;
  }

  private loadSubCategories(): void {
    this.menuCategoriesService
      .menuCategoriesGetSubCategoriesGet({
        categoryType: this.activeCategoryType,
        ItemPerPage: 100,
        Search: this.searchTerm() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.subCategories.set(res.results ?? []),
        error: () => this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถโหลดข้อมูลได้' }),
      });
  }

  private setupBreadcrumbButtons(): void {
    if (!this.canCreate) return;
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: this.tabs[0].addLabel,
        severity: 'primary',
        callback: () =>
          this.router.navigate(['/menu/categories/create'], {
            queryParams: { categoryType: this.activeCategoryType },
          }),
      },
    });
  }

  private updateAddButtonLabel(): void {
    if (!this.canCreate) return;
    const tab = this.tabs[this.activeTabIndex()];
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: tab.addLabel,
        severity: 'primary',
        callback: () =>
          this.router.navigate(['/menu/categories/create'], {
            queryParams: { categoryType: tab.categoryType },
          }),
      },
    });
  }
}
