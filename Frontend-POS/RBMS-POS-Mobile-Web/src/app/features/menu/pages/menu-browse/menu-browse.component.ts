import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerCategoryModel } from '@core/api/models/customer-category-model';
import { CustomerSubCategoryModel } from '@core/api/models/customer-sub-category-model';
import { CustomerMenuItemResponseModel } from '@core/api/models/customer-menu-item-response-model';
import { CartService } from '@core/services/cart.service';
import { MessageService } from 'primeng/api';
import { MenuDetailSheetComponent } from '../../dialogs/menu-detail-sheet/menu-detail-sheet.component';

const CATEGORY_CONFIG: Record<number, { icon: string; label: string }> = {
  1: { icon: 'chicken-drumstick', label: 'อาหาร' },
  2: { icon: 'drinks-glass', label: 'เครื่องดื่ม' },
  3: { icon: 'dessert', label: 'ของหวาน' },
};

@Component({
  selector: 'app-menu-browse',
  standalone: false,
  providers: [DialogService],
  template: `
    <!-- Category Tabs (Segmented Control) -->
    <div class="flex bg-white rounded-xl gap-1 mx-4 mt-4 p-1">
      @for (cat of categories(); track cat.categoryType) {
        <button
          class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all"
          [class]="selectedCategoryType === cat.categoryType
            ? 'bg-primary-subtle text-primary'
            : 'text-surface-sub hover:text-primary'"
          (click)="toggleCategory(cat.categoryType!)"
        >
          <app-generic-icon [name]="getCategoryIcon(cat.categoryType!)" svgClass="w-6 h-6"></app-generic-icon>
          {{ getCategoryLabel(cat.categoryType!) || cat.name }}
        </button>
      }
    </div>

    <!-- Search -->
    <div class="relative mx-4 mt-3">
      <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"></i>
      <input
        type="text"
        placeholder="ค้นหาเมนู..."
        class="w-full pl-10 pr-9 py-3 rounded-xl border border-surface-border bg-white text-sm"
        [(ngModel)]="searchTerm"
        (keyup.enter)="onSearch()"
      />
      @if (searchTerm) {
        <i
          class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-surface-sub hover:text-primary"
          (click)="clearSearch()"
        ></i>
      }
    </div>

    <!-- Sub-Category Chips -->
    @if (filteredSubCategories().length > 0) {
      <div class="flex gap-2 px-4 mt-3 overflow-x-auto pb-1" style="scrollbar-width: none;">
        <button
          class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border-2"
          [class]="selectedSubCategoryId === null
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-surface-sub border-surface-border hover:border-primary hover:text-primary'"
          (click)="selectSubCategory(null)"
        >
          ทั้งหมด
        </button>
        @for (sub of filteredSubCategories(); track sub.subCategoryId) {
          <button
            class="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border-2"
            [class]="selectedSubCategoryId === sub.subCategoryId
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-surface-sub border-surface-border hover:border-primary hover:text-primary'"
            (click)="selectSubCategory(sub.subCategoryId!)"
          >
            {{ sub.name }}
          </button>
        }
      </div>
    }

    <!-- Menu Grid -->
    <div class="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-3 p-4">
      @for (item of menuItems(); track item.menuId) {
        <app-menu-card [item]="item" (cardClick)="onCardClick(item)"></app-menu-card>
      } @empty {
        <div class="col-span-full flex flex-col items-center py-16">
          <app-generic-icon name="food" svgClass="w-16 h-16" class="text-surface-muted"></app-generic-icon>
          <p class="text-surface-sub mt-3 font-medium">ไม่พบเมนู</p>
        </div>
      }
    </div>
  `,
})
export class MenuBrowseComponent {
  categories = signal<CustomerCategoryModel[]>([]);
  allSubCategories: CustomerSubCategoryModel[] = [];
  filteredSubCategories = signal<CustomerSubCategoryModel[]>([]);
  menuItems = signal<CustomerMenuItemResponseModel[]>([]);

  selectedCategoryType: number | null = null;
  selectedSubCategoryId: number | null = null;
  searchTerm = '';

  constructor(
    private selfOrderService: SelfOrderService,
    private dialogService: DialogService,
    private cartService: CartService,
    private messageService: MessageService,
    private destroyRef: DestroyRef,
  ) {
    this.loadCategories();
    this.loadMenuItems();
  }

  getCategoryIcon(type: number): string {
    return CATEGORY_CONFIG[type]?.icon ?? 'food';
  }

  getCategoryLabel(type: number): string {
    return CATEGORY_CONFIG[type]?.label ?? '';
  }

  toggleCategory(categoryType: number): void {
    const next = this.selectedCategoryType === categoryType ? null : categoryType;
    this.selectedCategoryType = next;
    this.selectedSubCategoryId = null;
    this.filteredSubCategories.set(
      next === null
        ? this.allSubCategories
        : this.allSubCategories.filter(s => s.categoryType === next)
    );
    this.loadMenuItems();
  }

  selectSubCategory(subCategoryId: number | null): void {
    this.selectedSubCategoryId = subCategoryId;
    this.loadMenuItems();
  }

  onSearch(): void {
    this.loadMenuItems();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadMenuItems();
  }

  onCardClick(item: CustomerMenuItemResponseModel): void {
    if (item.hasOptions) {
      this.dialogService.open(MenuDetailSheetComponent, {
        data: { menuId: item.menuId },
        showHeader: false,
        styleClass: 'bottom-sheet',
        modal: true,
      });
    } else {
      this.cartService.addItem({
        menuId: item.menuId!,
        name: item.name!,
        price: item.price ?? 0,
        quantity: 1,
        selectedOptions: [],
        imageFileId: item.imageFileId,
        itemTotal: item.price ?? 0,
      });
      this.messageService.add({
        severity: 'success',
        summary: 'เพิ่มลงตะกร้าแล้ว',
        detail: item.name!,
        life: 2000,
      });
    }
  }

  private loadCategories(): void {
    this.selfOrderService.selfOrderGetMenuCategoriesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categories.set(res.result?.categories ?? []);
          this.allSubCategories = res.result?.subCategories ?? [];
          this.filteredSubCategories.set(this.allSubCategories);
        },
      });
  }

  private loadMenuItems(): void {
    const params: { categoryType?: number; subCategoryId?: number; search?: string } = {};
    if (this.selectedCategoryType !== null) params.categoryType = this.selectedCategoryType;
    if (this.selectedSubCategoryId !== null) params.subCategoryId = this.selectedSubCategoryId;
    if (this.searchTerm.trim()) params.search = this.searchTerm.trim();

    this.selfOrderService.selfOrderGetMenuItemsGet(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.menuItems.set(res.result ?? []),
      });
  }
}
