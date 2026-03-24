import { Component, DestroyRef, effect, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { SignalRService } from '@core/services/signalr.service';
import { CustomerTrackingItemModel } from '@core/api/models/customer-tracking-item-model';
import { CustomerOrderTrackingResponseModelBaseResponseModel } from '@core/api/models/customer-order-tracking-response-model-base-response-model';

@Component({
  selector: 'app-order-tracking',
  standalone: false,
  template: `
    @if (items().length > 0) {
      <div class="divide-y divide-surface-border">
        @for (item of items(); track item.orderItemId) {
          <div class="bg-white p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ item.menuName }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-surface-sub">x{{ item.quantity }}</span>
                  <span class="text-xs text-surface-sub">฿{{ item.totalPrice }}</span>
                </div>
                @if (item.orderedBy) {
                  <p class="text-xs text-surface-sub mt-0.5">สั่งโดย {{ item.orderedBy }}</p>
                }
              </div>
              <span class="shrink-0 ml-2 text-xs font-medium px-2 py-1 rounded-full"
                    [class]="getStatusClass(item.status!)">
                {{ getStatusLabel(item.status!) }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Summary -->
      <div class="bg-white border-t border-surface-border p-4 mt-2">
        <div class="flex justify-between items-center">
          <span class="font-medium">ยอดรวม</span>
          <span class="text-lg font-semibold text-primary">฿{{ subTotal() }}</span>
        </div>
        <p class="text-xs text-surface-sub mt-1">{{ orderNumber() }}</p>
      </div>
    } @else {
      <div class="flex flex-col items-center justify-center py-20 px-6">
        <app-generic-icon name="order-dinner" svgClass="w-16 h-16" class="text-surface-muted"></app-generic-icon>
        <p class="text-surface-sub mt-4 text-sm">ยังไม่มีออเดอร์</p>
        <button pButton label="สั่งอาหาร" severity="secondary" [outlined]="true" class="mt-4" routerLink="/menu"></button>
      </div>
    }
  `,
})
export class OrderTrackingComponent implements OnInit {
  items = signal<CustomerTrackingItemModel[]>([]);
  subTotal = signal(0);
  orderNumber = signal('');

  constructor(
    private selfOrderService: SelfOrderService,
    private signalR: SignalRService,
    private destroyRef: DestroyRef,
  ) {
    // Auto-refresh when SignalR sends RefreshOrders / NewOrderItems / ItemStatusChanged
    effect(() => {
      this.signalR.refreshOrders();
      this.loadTracking();
    });
  }

  ngOnInit(): void {
    this.loadTracking();
  }

  private loadTracking(): void {
    this.selfOrderService.selfOrderGetOrdersGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: CustomerOrderTrackingResponseModelBaseResponseModel) => {
          this.items.set(res.result?.items ?? []);
          this.subTotal.set(res.result?.subTotal ?? 0);
          this.orderNumber.set(res.result?.orderNumber ?? '');
        },
      });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Sent': return 'รอทำ';
      case 'Preparing': return 'กำลังทำ';
      case 'Ready': return 'เสร็จแล้ว';
      case 'Served': return 'เสิร์ฟแล้ว';
      case 'Cancelled': return 'ยกเลิก';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Sent': return 'bg-surface text-surface-sub';
      case 'Preparing': return 'bg-warning/10 text-warning';
      case 'Ready': return 'bg-success/10 text-success';
      case 'Served': return 'bg-surface text-surface-muted';
      case 'Cancelled': return 'bg-danger/10 text-danger line-through';
      default: return 'bg-surface text-surface-sub';
    }
  }
}
