import { Component, computed, DestroyRef, effect, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { SignalRService } from '@core/services/signalr.service';
import { CustomerTrackingItemModel } from '@core/api/models/customer-tracking-item-model';
import { CustomerOrderTrackingResponseModelBaseResponseModel } from '@core/api/models/customer-order-tracking-response-model-base-response-model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-order-tracking',
  standalone: false,
  templateUrl: './order-tracking.component.html',
})
export class OrderTrackingComponent implements OnInit {
  items = signal<CustomerTrackingItemModel[]>([]);
  subTotal = signal(0);
  orderNumber = signal('');
  lottieOptions: AnimationOptions = { path: 'animations/order-waiting.json' };

  // Filter signals
  sourceTableFilter = signal<string | null>(null);
  orderedByFilter = signal<string | null>(null);

  sourceTableNames = computed(() => {
    const names = new Set(this.items().map(i => i.sourceTableName).filter(Boolean) as string[]);
    return Array.from(names);
  });

  hasMultipleTables = computed(() => this.sourceTableNames().length > 1);

  orderedByNames = computed(() => {
    let items = this.items();
    const st = this.sourceTableFilter();
    if (st) items = items.filter(i => i.sourceTableName === st);
    const names = new Set(items.map(i => i.orderedBy).filter(Boolean) as string[]);
    return Array.from(names);
  });

  hasMultipleOrderers = computed(() => this.orderedByNames().length > 1);

  filteredItems = computed(() => {
    let items = this.items();
    const st = this.sourceTableFilter();
    if (st) items = items.filter(i => i.sourceTableName === st);
    const ob = this.orderedByFilter();
    if (ob) items = items.filter(i => i.orderedBy === ob);
    return items;
  });

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

  onSourceTableChange(value: string | null): void {
    this.sourceTableFilter.set(value || null);
    this.orderedByFilter.set(null);
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
      case 'Sent': return 'bg-info-bg text-info';
      case 'Preparing': return 'bg-warning-bg text-warning-dark';
      case 'Ready': return 'bg-success-bg text-success';
      case 'Served': return 'bg-surface text-surface-muted';
      case 'Cancelled': return 'bg-danger-bg text-danger line-through';
      default: return 'bg-surface text-surface-sub';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Sent': return 'chef';
      case 'Preparing': return 'kitchen-room';
      case 'Ready': return 'check-in';
      case 'Served': return 'order-dinner';
      case 'Cancelled': return 'error';
      default: return 'order-dinner';
    }
  }

  getItemBorderClass(status: string): string {
    switch (status) {
      case 'Sent': return 'border-info bg-info-bg';
      case 'Preparing': return 'border-warning bg-warning-bg';
      case 'Ready': return 'border-success bg-success-bg';
      case 'Served': return 'border-surface-border bg-surface';
      case 'Cancelled': return 'border-danger bg-danger-bg';
      default: return 'border-surface-border';
    }
  }

  getItemIconBgClass(status: string): string {
    switch (status) {
      case 'Sent': return 'bg-info-bg';
      case 'Preparing': return 'bg-warning-bg';
      case 'Ready': return 'bg-success-bg';
      case 'Served': return 'bg-surface-hover';
      case 'Cancelled': return 'bg-danger-bg';
      default: return 'bg-surface';
    }
  }

  getImageUrl(fileId?: number | null): string | null {
    return fileId ? `${environment.apiUrl}/api/admin/file/${fileId}` : null;
  }

  getItemIconTextClass(status: string): string {
    switch (status) {
      case 'Sent': return 'text-info';
      case 'Preparing': return 'text-warning-dark';
      case 'Ready': return 'text-success';
      case 'Served': return 'text-surface-muted';
      case 'Cancelled': return 'text-danger';
      default: return 'text-surface-sub';
    }
  }
}
