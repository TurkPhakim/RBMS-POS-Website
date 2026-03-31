import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CartService } from '@core/services/cart.service';
import { ModalService, Icon } from '@core/services/modal.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-cart-page',
  standalone: false,
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent implements OnInit {
  isSubmitting = signal(false);
  isBillingStatus = signal(false);
  orderNumber = signal('');
  noteEditIndex: number | null = null;
  lottieOptions: AnimationOptions = { path: 'animations/basket-shopping.json' };

  constructor(
    public cartService: CartService,
    private selfOrderService: SelfOrderService,
    private modalService: ModalService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.selfOrderService.selfOrderGetOrdersGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orderNumber.set(res.result?.orderNumber ?? '');
          this.isBillingStatus.set(res.result?.orderStatus === 'Billing');
        },
      });
  }

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

  toggleNote(index: number): void {
    this.noteEditIndex = this.noteEditIndex === index ? null : index;
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
    if (this.noteEditIndex === index) this.noteEditIndex = null;
  }

  submitOrder(): void {
    this.modalService.info({
      title: 'ยืนยันสั่งอาหาร',
      message: `${this.cartService.itemCount()} รายการ รวม ${this.cartService.totalPrice()} บาท`,
      icon: Icon.Question,
      confirmButtonLabel: 'สั่งเลย',
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
          this.modalService.success({
            title: 'สั่งอาหารสำเร็จ',
            message: 'ออเดอร์ถูกส่งไปที่ครัวแล้ว',
          });
          this.router.navigate(['/orders'], { replaceUrl: true });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: err?.error?.message || 'ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่',
          });
        },
      });
  }
}
