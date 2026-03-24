import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItemsService } from '@app/core/api/services/menu-items.service';
import { ShopSettingsService } from '@app/core/api/services/shop-settings.service';
import { MenuResponseModel } from '@app/core/api/models/menu-response-model';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-menu';

const CATEGORY_CONFIG: Record<number, { title: string; icon: string; basePath: string; permissionPrefix: string }> = {
  1: { title: 'เมนูอาหาร', icon: 'food', basePath: '/menu/food', permissionPrefix: 'menu-food' },
  2: { title: 'เมนูเครื่องดื่ม', icon: 'drinks-glass', basePath: '/menu/beverage', permissionPrefix: 'menu-beverage' },
  3: { title: 'เมนูของหวาน', icon: 'dessert', basePath: '/menu/dessert', permissionPrefix: 'menu-dessert' },
};

@Component({
  selector: 'app-menu-list',
  standalone: false,
  templateUrl: './menu-list.component.html',
})
export class MenuListComponent implements OnInit, OnDestroy {
  menus = signal<MenuResponseModel[]>([]);
  totalRecords = signal(0);
  hasTwoPeriods = signal(false);

  searchTerm = '';
  selectedSubCategoryId: number | null = null;
  selectedStatus: boolean | null = null;
  selectedPeriod: string | null = null;
  page = 1;
  rows = 10;

  categoryType = 1;
  config = CATEGORY_CONFIG[1];

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly menuItemsService: MenuItemsService,
    private readonly shopSettingsService: ShopSettingsService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly apiConfig: ApiConfiguration,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = false;
    this.canUpdate = false;
    this.canDelete = false;
  }

  ngOnInit(): void {
    this.categoryType = this.route.parent?.snapshot.data['categoryType'] ?? 1;
    this.config = CATEGORY_CONFIG[this.categoryType] ?? CATEGORY_CONFIG[1];
    const prefix = this.config.permissionPrefix;
    this.canCreate = this.authService.hasPermission(`${prefix}.create`);
    this.canUpdate = this.authService.hasPermission(`${prefix}.update`);
    this.canDelete = this.authService.hasPermission(`${prefix}.delete`);
    this.loadShopSettings();
    this.loadMenus();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
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

  getTagLabels(tags: number | undefined): { label: string; severity: string }[] {
    if (!tags) return [];
    const result: { label: string; severity: string }[] = [];
    if (tags & 1) result.push({ label: 'แนะนำ', severity: 'info' });
    if (tags & 2) result.push({ label: 'ตามเทศกาล', severity: 'warn' });
    if (tags & 4) result.push({ label: 'ช้า', severity: 'danger' });
    return result;
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadMenus();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadMenus();
  }

  onEdit(menuId: number): void {
    this.router.navigate([this.config.basePath, 'update', menuId]);
  }

  onDelete(menuId: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบเมนู "${name}" หรือไม่?`,
      onConfirm: () => {
        this.menuItemsService
          .menuItemsDeleteMenuDelete({ menuId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadMenus();
            },
            error: () =>
              this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถลบเมนูได้' }),
          });
      },
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

  private loadMenus(): void {
    this.menuItemsService
      .menuItemsGetMenusGet({
        categoryType: this.categoryType,
        subCategoryId: this.selectedSubCategoryId ?? undefined,
        isAvailable: this.selectedStatus ?? undefined,
        period: this.selectedPeriod ?? undefined,
        Page: this.page,
        ItemPerPage: this.rows,
        search: this.searchTerm || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.menus.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
        error: () =>
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถโหลดข้อมูลได้' }),
      });
  }

  private setupBreadcrumbButtons(): void {
    if (!this.canCreate) return;
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่มเมนู',
        severity: 'primary',
        callback: () => this.router.navigate([this.config.basePath, 'create']),
      },
    });
  }
}
