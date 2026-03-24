import { Component, DestroyRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CartService } from '@core/services/cart.service';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { environment } from '@env/environment';

@Component({
  selector: 'app-cart-page',
  standalone: false,
  providers: [DialogService],
  template: `
    @if (cartService.itemCount() > 0) {
      <!-- Cart Header -->
      <div class="bg-gradient-to-r from-primary to-primary-dark mx-4 mt-4 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            <app-generic-icon name="basket-shopping" svgClass="w-7 h-7" class="text-white"></app-generic-icon>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-white">ตะกร้าของคุณ</h2>
            <p class="text-sm text-white/80">{{ cartService.itemCount() }} รายการ</p>
          </div>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="space-y-2 px-4 mt-3">
        @for (item of cartService.items(); track $index) {
          <div class="rounded-xl bg-white border border-surface-border overflow-hidden">
            <!-- Menu Name + Delete -->
            <div class="px-4 pt-3 pb-1 flex items-start justify-between gap-2">
              <div class="flex gap-3 flex-1 min-w-0">
                <!-- Thumbnail -->
                <div class="w-14 h-14 rounded-lg bg-surface overflow-hidden shrink-0">
                  @if (item.imageFileId) {
                    <img [src]="getImageUrl(item.imageFileId)" [alt]="item.name" class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center">
                      <app-generic-icon name="food" svgClass="w-6 h-6" class="text-surface-muted"></app-generic-icon>
                    </div>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-sm truncate">{{ item.name }}</div>
                  @if (item.selectedOptions.length > 0) {
                    <div class="text-xs text-surface-sub mt-0.5 truncate">
                      {{ formatOptions(item.selectedOptions) }}
                    </div>
                  }
                  @if (item.note) {
                    <div class="text-xs text-warning mt-0.5 truncate italic">
                      <i class="pi pi-pencil text-[10px] mr-0.5"></i>{{ item.note }}
                    </div>
                  }
                </div>
              </div>
              <button
                class="w-8 h-8 rounded-lg text-danger hover:bg-danger/10 flex items-center justify-center transition-colors shrink-0"
                (click)="removeItem($index)"
              >
                <i class="pi pi-trash text-sm"></i>
              </button>
            </div>
            <!-- Note -->
            <div class="px-4 pt-1">
              <div class="relative">
                <i class="pi pi-pencil absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted text-xs"></i>
                <input
                  type="text"
                  placeholder="หมายเหตุ เช่น ไม่ใส่ผัก"
                  class="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-surface-border bg-surface"
                  [value]="item.note || ''"
                  (change)="updateNote($index, $any($event.target).value)"
                />
              </div>
            </div>
            <!-- Quantity + Price -->
            <div class="px-4 pb-3 pt-1 flex items-center justify-between">
              <div class="flex items-center border border-surface-border rounded-full overflow-hidden">
                <button
                  class="w-9 h-8 bg-surface hover:bg-surface-border flex items-center justify-center transition-colors"
                  (click)="decreaseQty($index)"
                  [disabled]="item.quantity <= 1"
                >
                  <i class="pi pi-minus text-[10px] font-bold text-surface-sub"></i>
                </button>
                <span class="font-bold text-sm w-9 text-center bg-white">{{ item.quantity }}</span>
                <button
                  class="w-9 h-8 bg-surface hover:bg-surface-border flex items-center justify-center transition-colors"
                  (click)="increaseQty($index)"
                >
                  <i class="pi pi-plus text-[10px] font-bold text-primary"></i>
                </button>
              </div>
              <span class="font-bold text-lg text-primary">฿{{ item.itemTotal | number:'1.0-0' }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Spacer for fixed footer -->
      <div class="h-36"></div>

      <!-- Fixed Footer: Total + Submit -->
      <div class="fixed bottom-[66px] left-0 right-0 bg-white border-t border-surface-border px-4 py-3 z-10">
        <div class="bg-primary-subtle rounded-xl p-3 flex justify-between items-center mb-3">
          <span class="font-bold">รวมทั้งหมด</span>
          <span class="text-xl font-bold text-primary">฿{{ cartService.totalPrice() | number:'1.0-0' }}</span>
        </div>
        <button
          pButton
          label="สั่งอาหาร"
          class="w-full py-3"
          (click)="submitOrder()"
          [loading]="isSubmitting()"
        ></button>
      </div>
    } @else {
      <!-- Empty State -->
      <div class="flex flex-col items-center justify-center py-24 px-6">
        <div class="w-20 h-20 rounded-full bg-primary-subtle flex items-center justify-center mb-4">
          <app-generic-icon name="basket-shopping" svgClass="w-10 h-10" class="text-primary"></app-generic-icon>
        </div>
        <p class="text-lg font-semibold mb-1">ตะกร้าว่าง</p>
        <p class="text-sm text-surface-sub mb-5">เลือกเมนูอาหารที่ชอบเพิ่มลงตะกร้าได้เลย</p>
        <button pButton label="ดูเมนู" class="px-8" routerLink="/menu"></button>
      </div>
    }
  `,
})
export class CartPageComponent {
  isSubmitting = signal(false);

  constructor(
    public cartService: CartService,
    private selfOrderService: SelfOrderService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  getImageUrl(fileId: number): string {
    return `${environment.apiUrl}/api/admin/file/${fileId}`;
  }

  formatOptions(options: { name: string }[]): string {
    return options.map(o => o.name).join(', ');
  }

  increaseQty(index: number): void {
    const item = this.cartService.items()[index];
    this.cartService.updateQuantity(index, item.quantity + 1);
  }

  decreaseQty(index: number): void {
    const item = this.cartService.items()[index];
    if (item.quantity > 1) {
      this.cartService.updateQuantity(index, item.quantity - 1);
    }
  }

  updateNote(index: number, note: string): void {
    this.cartService.updateNote(index, note);
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }

  submitOrder(): void {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        title: 'ยืนยันสั่งอาหาร',
        message: `${this.cartService.itemCount()} รายการ รวม ฿${this.cartService.totalPrice()}`,
        confirmLabel: 'สั่งเลย',
      },
      showHeader: false,
      styleClass: 'alert-dialog',
      modal: true,
    }).onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.doSubmit();
      });
  }

  private doSubmit(): void {
    this.isSubmitting.set(true);

    const items = this.cartService.items().map(item => ({
      menuId: item.menuId,
      quantity: item.quantity,
      note: item.note,
      optionItemIds: item.selectedOptions.map(o => o.optionItemId),
    }));

    this.selfOrderService.selfOrderSubmitOrderPost({ body: { items } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cartService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'สั่งอาหารสำเร็จ',
            detail: 'ออเดอร์ถูกส่งไปที่ครัวแล้ว',
            life: 3000,
          });
          this.router.navigate(['/orders'], { replaceUrl: true });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: err?.error?.message || 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่',
            life: 5000,
          });
        },
      });
  }
}
