import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerMenuDetailResponseModel } from '@core/api/models/customer-menu-detail-response-model';
import { CartService, SelectedOption } from '@core/services/cart.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-menu-detail-sheet',
  standalone: false,
  template: `
    @if (detail()) {
      <div>
        <!-- Header: Drag handle + Close button -->
        <div class="relative flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-surface-muted"></div>
          <button
            class="absolute right-3 top-2 w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-surface-border transition-colors"
            (click)="close()"
          >
            <i class="pi pi-times text-sm text-surface-sub"></i>
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="overflow-y-auto" style="max-height: calc(85vh - 140px)">
          <!-- Image -->
          <div class="aspect-video bg-surface overflow-hidden">
            @if (detail()!.imageFileId) {
              <img [src]="getImageUrl(detail()!.imageFileId!)" [alt]="detail()!.name" class="w-full h-full object-cover">
            } @else {
              <div class="w-full h-full flex items-center justify-center">
                <app-generic-icon name="food" svgClass="w-20 h-20" class="text-surface-muted"></app-generic-icon>
              </div>
            }
          </div>

          <!-- Info -->
          <div class="px-4 pt-4 pb-2">
            <div class="flex items-start justify-between gap-2">
              <h2 class="text-xl font-bold flex-1">{{ detail()!.name }}</h2>
              <span class="text-xl font-bold text-primary shrink-0">฿{{ detail()!.price | number:'1.0-0' }}</span>
            </div>
            @if (detail()!.nameEn) {
              <p class="text-sm text-surface-sub mt-0.5">{{ detail()!.nameEn }}</p>
            }
            @if (detail()!.description) {
              <p class="text-sm text-surface-sub mt-2">{{ detail()!.description }}</p>
            }
            <div class="flex gap-1.5 mt-2">
              @if (detail()!.isRecommended) {
                <span class="text-xs bg-primary-subtle text-primary-text px-2 py-0.5 rounded-full font-medium">แนะนำ</span>
              }
              @if (detail()!.isNew) {
                <span class="text-xs bg-success-bg text-success-text px-2 py-0.5 rounded-full font-medium">ใหม่</span>
              }
            </div>
          </div>

          <!-- Option Groups -->
          @for (group of detail()!.optionGroups; track group.optionGroupId) {
            <div class="px-4 py-3 border-t border-surface-border">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-semibold">{{ group.name }}</span>
                @if (group.isRequired) {
                  <span class="text-xs bg-danger text-white px-2 py-0.5 rounded-full font-medium">จำเป็น</span>
                }
                @if (group.maxSelections === 1) {
                  <span class="text-xs text-surface-sub">(เลือก 1)</span>
                } @else if (group.maxSelections) {
                  <span class="text-xs text-surface-sub">(สูงสุด {{ group.maxSelections }})</span>
                }
              </div>

              <div class="space-y-1">
                @if (group.maxSelections === 1) {
                  @for (opt of group.items; track opt.optionItemId) {
                    <button
                      class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                      [class]="radioSelections[group.optionGroupId!] === opt.optionItemId
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'bg-surface'"
                      (click)="selectRadio(group.optionGroupId!, opt.optionItemId!)"
                    >
                      <div class="flex items-center gap-2">
                        <i class="text-sm"
                           [class]="radioSelections[group.optionGroupId!] === opt.optionItemId
                             ? 'pi pi-check-circle text-primary'
                             : 'pi pi-circle text-surface-sub'"></i>
                        <span class="text-sm">{{ opt.name }}</span>
                      </div>
                      @if (opt.additionalPrice && opt.additionalPrice > 0) {
                        <span class="text-sm text-primary font-semibold">+฿{{ opt.additionalPrice }}</span>
                      }
                    </button>
                  }
                } @else {
                  @for (opt of group.items; track opt.optionItemId) {
                    <button
                      class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                      [class]="isCheckboxSelected(group.optionGroupId!, opt.optionItemId!)
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'bg-surface'"
                      (click)="toggleCheckbox(group.optionGroupId!, opt.optionItemId!)"
                    >
                      <div class="flex items-center gap-2">
                        <i class="text-sm"
                           [class]="isCheckboxSelected(group.optionGroupId!, opt.optionItemId!)
                             ? 'pi pi-check-square text-primary'
                             : 'pi pi-stop text-surface-sub'"></i>
                        <span class="text-sm">{{ opt.name }}</span>
                      </div>
                      @if (opt.additionalPrice && opt.additionalPrice > 0) {
                        <span class="text-sm text-primary font-semibold">+฿{{ opt.additionalPrice }}</span>
                      }
                    </button>
                  }
                }
              </div>
            </div>
          }

        </div>

        <!-- Footer: Quantity + Add to Cart -->
        <div class="border-t border-surface-border px-4 py-3 bg-white">
          <div class="flex items-center justify-center gap-5 mb-3">
            <button
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center transition-colors active:bg-surface-border"
              (click)="decreaseQty()"
              [disabled]="quantity <= 1"
            >
              <i class="pi pi-minus text-sm"></i>
            </button>
            <span class="text-xl font-bold w-8 text-center">{{ quantity }}</span>
            <button
              class="w-10 h-10 rounded-full bg-surface flex items-center justify-center transition-colors active:bg-surface-border"
              (click)="increaseQty()"
            >
              <i class="pi pi-plus text-sm text-primary"></i>
            </button>
          </div>
          <button
            pButton
            class="w-full py-3"
            [label]="'เพิ่มลงตะกร้า ฿' + (calcTotalPrice() | number:'1.0-0')"
            (click)="addToCart()"
          ></button>
        </div>
      </div>
    }
  `,
})
export class MenuDetailSheetComponent {
  detail = signal<CustomerMenuDetailResponseModel | null>(null);
  quantity = 1;
  radioSelections: Record<number, number> = {};
  checkboxSelections: Record<number, number[]> = {};

  constructor(
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private selfOrderService: SelfOrderService,
    private cartService: CartService,
    private destroyRef: DestroyRef,
  ) {
    const menuId = this.config.data.menuId as number;
    this.loadDetail(menuId);
  }

  getImageUrl(fileId: number): string {
    return `${environment.apiUrl}/api/admin/file/${fileId}`;
  }

  selectRadio(groupId: number, optionItemId: number): void {
    this.radioSelections[groupId] = optionItemId;
  }

  isCheckboxSelected(groupId: number, optionItemId: number): boolean {
    return (this.checkboxSelections[groupId] ?? []).includes(optionItemId);
  }

  toggleCheckbox(groupId: number, optionItemId: number): void {
    const current = this.checkboxSelections[groupId] ?? [];
    const idx = current.indexOf(optionItemId);
    if (idx >= 0) {
      this.checkboxSelections[groupId] = current.filter(id => id !== optionItemId);
    } else {
      this.checkboxSelections[groupId] = [...current, optionItemId];
    }
  }

  calcTotalPrice(): number {
    const d = this.detail();
    if (!d) return 0;
    const base = d.price ?? 0;
    let optPrice = 0;

    for (const groupId of Object.keys(this.radioSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +groupId);
      const item = group?.items?.find(i => i.optionItemId === this.radioSelections[+groupId]);
      if (item?.additionalPrice) optPrice += item.additionalPrice;
    }

    for (const groupId of Object.keys(this.checkboxSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +groupId);
      for (const optId of this.checkboxSelections[+groupId]) {
        const item = group?.items?.find(i => i.optionItemId === optId);
        if (item?.additionalPrice) optPrice += item.additionalPrice;
      }
    }

    return (base + optPrice) * this.quantity;
  }

  close(): void { this.ref.close(); }
  increaseQty(): void { this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    const d = this.detail();
    if (!d) return;

    for (const group of d.optionGroups ?? []) {
      if (!group.isRequired) continue;
      if (group.maxSelections === 1 && !this.radioSelections[group.optionGroupId!]) return;
      if (group.maxSelections !== 1 && !this.checkboxSelections[group.optionGroupId!]?.length) return;
    }

    const selectedOptions: SelectedOption[] = [];

    for (const [gId, optId] of Object.entries(this.radioSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +gId);
      const item = group?.items?.find(i => i.optionItemId === optId);
      if (item) {
        selectedOptions.push({
          optionItemId: item.optionItemId!,
          name: item.name!,
          additionalPrice: item.additionalPrice ?? 0,
          groupName: group!.name!,
        });
      }
    }

    for (const [gId, optIds] of Object.entries(this.checkboxSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +gId);
      for (const optId of optIds) {
        const item = group?.items?.find(i => i.optionItemId === optId);
        if (item) {
          selectedOptions.push({
            optionItemId: item.optionItemId!,
            name: item.name!,
            additionalPrice: item.additionalPrice ?? 0,
            groupName: group!.name!,
          });
        }
      }
    }

    this.cartService.addItem({
      menuId: d.menuId!,
      name: d.name!,
      price: d.price ?? 0,
      quantity: this.quantity,
      selectedOptions,
      imageFileId: d.imageFileId,
      itemTotal: this.calcTotalPrice(),
    });

    this.ref.close(true);
  }

  private loadDetail(menuId: number): void {
    this.selfOrderService.selfOrderGetMenuDetailGet({ menuId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.detail.set(res.result ?? null);
          for (const group of res.result?.optionGroups ?? []) {
            if (group.maxSelections === 1) {
              if (group.isRequired && group.items?.length) {
                this.radioSelections[group.optionGroupId!] = group.items[0].optionItemId!;
              }
            } else {
              this.checkboxSelections[group.optionGroupId!] = [];
            }
          }
        },
      });
  }
}
