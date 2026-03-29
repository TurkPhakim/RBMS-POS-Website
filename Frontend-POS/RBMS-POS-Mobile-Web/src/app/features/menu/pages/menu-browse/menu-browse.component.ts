import { Component, DestroyRef, signal } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerCategoryModel } from '@core/api/models/customer-category-model';
import { CustomerSubCategoryModel } from '@core/api/models/customer-sub-category-model';
import { CustomerMenuItemResponseModel } from '@core/api/models/customer-menu-item-response-model';
import { CartService } from '@core/services/cart.service';
import { ModalService } from '@core/services/modal.service';

const CATEGORY_STYLES: Record<number, CategoryStyle> = {
  1: {
    icon: 'chicken-drumstick',
    label: 'อาหาร',
    activeClass: 'bg-surface-card text-cat-food',
    inactiveClass: 'text-surface-sub',
    chipActiveClass: 'bg-cat-food text-white border-cat-food',
    chipInactiveClass: 'bg-white text-surface-sub border-surface-border',
    cardRingClass: 'active:ring-2 active:ring-cat-food',
  },
  2: {
    icon: 'drinks-glass',
    label: 'เครื่องดื่ม',
    activeClass: 'bg-surface-card text-cat-drink',
    inactiveClass: 'text-surface-sub',
    chipActiveClass: 'bg-cat-drink text-white border-cat-drink',
    chipInactiveClass: 'bg-white text-surface-sub border-surface-border',
    cardRingClass: 'active:ring-2 active:ring-cat-drink',
  },
  3: {
    icon: 'dessert',
    label: 'ของหวาน',
    activeClass: 'bg-surface-card text-cat-dessert',
    inactiveClass: 'text-surface-sub',
    chipActiveClass: 'bg-cat-dessert text-white border-cat-dessert',
    chipInactiveClass: 'bg-white text-surface-sub border-surface-border',
    cardRingClass: 'active:ring-2 active:ring-cat-dessert',
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: 'food',
  label: '',
  activeClass: 'bg-surface-card text-primary',
  inactiveClass: 'text-surface-sub',
  chipActiveClass: 'bg-primary text-white border-primary',
  chipInactiveClass: 'bg-white text-surface-sub border-surface-border',
  cardRingClass: 'active:ring-2 active:ring-primary',
};

@Component({
  selector: 'app-menu-browse',
  standalone: false,
  templateUrl: './menu-browse.component.html',
})
export class MenuBrowseComponent {
  categories = signal<CustomerCategoryModel[]>([]);
  allSubCategories: CustomerSubCategoryModel[] = [];
  filteredSubCategories = signal<CustomerSubCategoryModel[]>([]);
  menuItems = signal<CustomerMenuItemResponseModel[]>([]);

  lottieOptions: AnimationOptions = {
    path: 'animations/order-sent.json',
  };

  selectedCategoryType: number | null = null;
  selectedSubCategoryId: number | null = null;
  searchTerm = '';

  constructor(
    private selfOrderService: SelfOrderService,
    private cartService: CartService,
    private modalService: ModalService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.loadCategories();
  }

  getCategoryIcon(type: number): string {
    return CATEGORY_STYLES[type]?.icon ?? 'food';
  }

  getCategoryLabel(type: number): string {
    return CATEGORY_STYLES[type]?.label ?? '';
  }

  getActiveStyle(): CategoryStyle {
    return CATEGORY_STYLES[this.selectedCategoryType ?? 0] ?? DEFAULT_STYLE;
  }

  getCategoryStyle(type: number): CategoryStyle {
    return CATEGORY_STYLES[type] ?? DEFAULT_STYLE;
  }

  selectCategory(categoryType: number): void {
    if (this.selectedCategoryType === categoryType) return;
    this.selectedCategoryType = categoryType;
    this.selectedSubCategoryId = null;
    this.filteredSubCategories.set(
      this.allSubCategories.filter(s => s.categoryType === categoryType)
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
      this.router.navigate(['/menu', item.menuId]);
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
    }
  }

  private loadCategories(): void {
    this.selfOrderService.selfOrderGetMenuCategoriesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const cats = res.result?.categories ?? [];
          this.categories.set(cats);
          this.allSubCategories = res.result?.subCategories ?? [];
          if (cats.length > 0) {
            this.selectCategory(cats[0].categoryType!);
          }
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

interface CategoryStyle {
  icon: string;
  label: string;
  activeClass: string;
  inactiveClass: string;
  chipActiveClass: string;
  chipInactiveClass: string;
  cardRingClass: string;
}
