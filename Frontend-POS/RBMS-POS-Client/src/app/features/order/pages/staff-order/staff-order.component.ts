import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AnimationOptions } from 'ngx-lottie';

import {
  AddOrderItemModel,
  MenuResponseModel,
  MenuSubCategoryResponseModel,
} from '@app/core/api/models';
import {
  MenuCategoriesService,
  MenuItemsService,
  OrdersService,
} from '@app/core/api/services';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { MenuItemDialogComponent } from '../../dialogs/menu-item-dialog/menu-item-dialog.component';

const KEY_BTN_BACK = 'back-staff-order';

@Component({
  selector: 'app-staff-order',
  standalone: false,
  templateUrl: './staff-order.component.html',
  providers: [DialogService],
})
export class StaffOrderComponent implements OnInit, OnDestroy {
  emptyCartLottie: AnimationOptions = {
    path: 'animations/basket-shopping.json',
  };

  orderId = 0;
  orderNumber = '';
  zoneName = '';
  tableName = '';
  guestCount = 0;

  categories: CategoryTab[] = [
    { label: 'อาหาร', type: 1, icon: 'chicken-drumstick', placeholderIcon: 'chicken-drumstick' },
    { label: 'เครื่องดื่ม', type: 2, icon: 'drinks-glass', placeholderIcon: 'drinks-glass' },
    { label: 'ของหวาน', type: 3, icon: 'dessert', placeholderIcon: 'dessert' },
  ];

  selectedCategory = signal(1);
  subCategories = signal<MenuSubCategoryResponseModel[]>([]);
  selectedSubCategoryId = signal<number | null>(null);
  menus = signal<MenuResponseModel[]>([]);
  filteredMenus = signal<MenuResponseModel[]>([]);
  cartItems = signal<CartItem[]>([]);
  isSending = signal(false);
  searchTerm = '';

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly menuCategoriesService: MenuCategoriesService,
    private readonly menuItemsService: MenuItemsService,
    private readonly modalService: ModalService,
    private readonly ordersService: OrdersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.orderNumber = this.route.snapshot.queryParamMap.get('orderNumber') ?? '';
    this.zoneName = this.route.snapshot.queryParamMap.get('zoneName') ?? '';
    this.tableName = this.route.snapshot.queryParamMap.get('tableName') ?? '';
    this.guestCount = Number(this.route.snapshot.queryParamMap.get('guestCount')) || 0;
    this.setupBreadcrumbButtons();
    this.loadCategoryData(1);
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
        callback: () => this.router.navigate(['/order', this.orderId]),
      },
    });
  }

  onSelectCategory(type: number): void {
    this.selectedCategory.set(type);
    this.selectedSubCategoryId.set(null);
    this.loadCategoryData(type);
  }

  private loadCategoryData(categoryType: number): void {
    this.menuCategoriesService
      .menuCategoriesGetSubCategoriesGet({ categoryType, ItemPerPage: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.subCategories.set(res.results ?? []);
        },
      });

    this.menuItemsService
      .menuItemsGetMenusGet({ categoryType, isAvailable: true, ItemPerPage: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.menus.set(res.results ?? []);
          this.searchTerm = '';
          this.applyFilters();
        },
      });
  }

  onSelectSubCategory(subCategoryId: number | null): void {
    this.selectedSubCategoryId.set(subCategoryId);
    this.applyFilters();
  }

  onSearchInput(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  hasTag(menu: MenuResponseModel, flag: number): boolean {
    return ((menu.tags ?? 0) & flag) !== 0;
  }

  private applyFilters(): void {
    let result = this.menus();

    const subCatId = this.selectedSubCategoryId();
    if (subCatId !== null) {
      result = result.filter((m) => m.subCategoryId === subCatId);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (m) =>
          m.nameThai?.toLowerCase().includes(term) ||
          m.nameEnglish?.toLowerCase().includes(term),
      );
    }

    result = [...result].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    this.filteredMenus.set(result);
  }

  get placeholderIcon(): string {
    return this.categories.find((c) => c.type === this.selectedCategory())?.placeholderIcon ?? 'food';
  }

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  onMenuClick(menu: MenuResponseModel): void {
    if (menu.optionGroups?.length) {
      const ref = this.dialogService.open(MenuItemDialogComponent, {
        header: 'ตัวเลือกเมนู',
        showHeader: false,
        styleClass: 'card-dialog',
        width: '40vw',
        data: { menu },
      });
      ref.onClose
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result: CartItem | undefined) => {
          if (result) {
            this.addToCart(result);
          }
        });
    } else {
      this.addToCart({
        menuId: menu.menuId!,
        nameThai: menu.nameThai ?? '',
        unitPrice: menu.price ?? 0,
        quantity: 1,
        note: '',
        options: [],
        optionsTotalPrice: 0,
        totalPrice: menu.price ?? 0,
      });
    }
  }

  private addToCart(item: CartItem): void {
    const current = this.cartItems();
    const existingIdx = current.findIndex(
      (c) =>
        c.menuId === item.menuId &&
        c.note === item.note &&
        JSON.stringify(c.options) === JSON.stringify(item.options),
    );
    if (existingIdx >= 0) {
      const updated = [...current];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + item.quantity,
        totalPrice:
          (updated[existingIdx].unitPrice + updated[existingIdx].optionsTotalPrice) *
          (updated[existingIdx].quantity + item.quantity),
      };
      this.cartItems.set(updated);
    } else {
      this.cartItems.set([...current, item]);
    }
  }

  onIncreaseQty(index: number): void {
    const updated = [...this.cartItems()];
    updated[index] = {
      ...updated[index],
      quantity: updated[index].quantity + 1,
      totalPrice:
        (updated[index].unitPrice + updated[index].optionsTotalPrice) *
        (updated[index].quantity + 1),
    };
    this.cartItems.set(updated);
  }

  onDecreaseQty(index: number): void {
    const updated = [...this.cartItems()];
    if (updated[index].quantity <= 1) {
      updated.splice(index, 1);
    } else {
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity - 1,
        totalPrice:
          (updated[index].unitPrice + updated[index].optionsTotalPrice) *
          (updated[index].quantity - 1),
      };
    }
    this.cartItems.set(updated);
  }

  onRemoveItem(index: number): void {
    const updated = [...this.cartItems()];
    updated.splice(index, 1);
    this.cartItems.set(updated);
  }

  getCartTotal(): number {
    return this.cartItems().reduce((sum, item) => sum + item.totalPrice, 0);
  }

  onSendToKitchen(): void {
    if (!this.cartItems().length) return;

    this.isSending.set(true);
    const items: AddOrderItemModel[] = this.cartItems().map((c) => ({
      menuId: c.menuId,
      quantity: c.quantity,
      note: c.note || undefined,
      options: c.options.length
        ? c.options.map((o) => ({
            optionGroupId: o.optionGroupId,
            optionItemId: o.optionItemId,
          }))
        : undefined,
    }));

    this.ordersService
      .ordersAddItemsPost({ orderId: this.orderId, body: { items } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ordersService
            .ordersSendToKitchenPost({ orderId: this.orderId })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.isSending.set(false);
                this.modalService.commonSuccess();
                this.router.navigate(['/order', this.orderId]);
              },
              error: () => this.isSending.set(false),
            });
        },
        error: () => this.isSending.set(false),
      });
  }

  onAddItemsOnly(): void {
    if (!this.cartItems().length) return;

    this.isSending.set(true);
    const items: AddOrderItemModel[] = this.cartItems().map((c) => ({
      menuId: c.menuId,
      quantity: c.quantity,
      note: c.note || undefined,
      options: c.options.length
        ? c.options.map((o) => ({
            optionGroupId: o.optionGroupId,
            optionItemId: o.optionItemId,
          }))
        : undefined,
    }));

    this.ordersService
      .ordersAddItemsPost({ orderId: this.orderId, body: { items } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSending.set(false);
          this.cartItems.set([]);
          this.modalService.commonSuccess();
        },
        error: () => this.isSending.set(false),
      });
  }
}

interface CartItem {
  menuId: number;
  nameThai: string;
  unitPrice: number;
  quantity: number;
  note: string;
  options: { optionGroupId: number; optionItemId: number; optionItemName: string; additionalPrice: number }[];
  optionsTotalPrice: number;
  totalPrice: number;
}

interface CategoryTab {
  label: string;
  type: number;
  icon: string;
  placeholderIcon: string;
}
