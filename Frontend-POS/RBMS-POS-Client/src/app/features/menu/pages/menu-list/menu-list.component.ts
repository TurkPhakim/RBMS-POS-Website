import { Component, signal, computed, DestroyRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenusService } from '@app/core/api/services';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { MenuResponseModel, EMenuCategory } from '@app/core/api/models';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

const KEY_BTN_ADD = 'add-menu';

type CategoryFilter = 'all' | 'food' | 'beverage';

@Component({
  selector: 'app-menu-list',
  standalone: false,
  templateUrl: './menu-list.component.html',
})
export class MenuListComponent implements OnDestroy {
  private allMenus = signal<MenuResponseModel[]>([]);
  categoryFilter = signal<CategoryFilter>('all');

  menus = computed(() => {
    const filter = this.categoryFilter();
    const all = this.allMenus();

    let filtered: MenuResponseModel[];

    if (filter === 'all') {
      filtered = all;
    } else {
      const categoryMap: Record<CategoryFilter, EMenuCategory | undefined> = {
        all: undefined,
        food: 1,
        beverage: 2,
      };

      const targetCategory = categoryMap[filter];
      if (targetCategory) {
        filtered = all.filter((menu) => menu.category === targetCategory);
      } else {
        filtered = all;
      }
    }

    return filtered.sort((a, b) => (a.menuId || 0) - (b.menuId || 0));
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showDeleteModal = signal(false);
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  successMessage = signal('');
  selectedMenu = signal<{ id: number; name: string } | null>(null);

  constructor(
    private readonly menusService: MenusService,
    private readonly apiConfig: ApiConfiguration,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly breadcrumbService: BreadcrumbService,
  ) {}

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  ngOnInit(): void {
    this.loadMenus();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่มเมนู',
        icon: 'pi pi-plus',
        callback: () => this.onAdd(),
      },
    });
  }

  loadMenus(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.menusService
      .apiMenuGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allMenus.set(response.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถโหลดข้อมูลเมนูได้');
          this.showErrorModal.set(true);
          this.isLoading.set(false);
        },
      });
  }

  setFilter(filter: CategoryFilter): void {
    this.categoryFilter.set(filter);
  }

  isFilterActive(filter: CategoryFilter): boolean {
    return this.categoryFilter() === filter;
  }

  onAdd(): void {
    this.router.navigate(['/menu/items/add']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/menu/items/edit', id]);
  }

  onDelete(id: number, name: string): void {
    this.selectedMenu.set({ id, name });
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const menu = this.selectedMenu();
    if (!menu) return;

    this.menusService
      .apiMenuMenuIdDelete({ menuId: menu.id! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteModal.set(false);
          this.successMessage.set(`ลบเมนู "${menu.name}" สำเร็จ`);
          this.showSuccessModal.set(true);
          this.loadMenus();
        },
        error: () => {
          this.errorMessage.set('ไม่สามารถลบเมนูได้');
          this.showErrorModal.set(true);
          this.showDeleteModal.set(false);
        },
      });
  }

  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.selectedMenu.set(null);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.successMessage.set('');
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  getCategoryLabel(category: EMenuCategory): string {
    switch (category) {
      case 1: return 'อาหาร';
      case 2: return 'เครื่องดื่ม';
      default: return 'ไม่ทราบ';
    }
  }

  getCategorySeverity(category: EMenuCategory): 'info' | 'warn' {
    switch (category) {
      case 1: return 'info';
      case 2: return 'warn';
      default: return 'info';
    }
  }
}
