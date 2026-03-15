import { Component, computed, DestroyRef, OnDestroy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { EMenuCategory, MenuResponseModel } from '@app/core/api/models';
import { MenusService } from '@app/core/api/services';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

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

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly menusService: MenusService,
    private readonly modalService: ModalService,
    private readonly router: Router,
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
        callback: () => this.onAdd(),
      },
    });
  }

  loadMenus(): void {
    this.menusService
      .menusGetAllGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.allMenus.set(response.results ?? []);
        },
        error: () => {
          this.modalService.cancel({ title: 'ผิดพลาด !', message: 'ไม่สามารถโหลดข้อมูลเมนูได้' });
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
    this.router.navigate(['/menu/items/create']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/menu/items/update', id]);
  }

  onDelete(id: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบเมนู "${name}"?`,
      confirmButtonLabel: 'ลบ',
      cancelButtonLabel: 'ยกเลิก',
      onConfirm: () => this.menusService.menusDeleteDelete({ menuId: id }),
    }).onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.modalService.commonSuccess();
          this.loadMenus();
        }
      });
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
