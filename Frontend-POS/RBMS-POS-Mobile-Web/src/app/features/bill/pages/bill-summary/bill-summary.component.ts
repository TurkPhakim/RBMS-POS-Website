import { Component, computed, DestroyRef, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerService } from '@core/api/services/customer.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { SignalRService } from '@core/services/signalr.service';
import { ReceiptService } from '@core/services/receipt.service';
import { CustomerBillResponseModel } from '@core/api/models/customer-bill-response-model';
import { CustomerOrderItemModel } from '@core/api/models/customer-order-item-model';
import { CustomerBillSummaryModel } from '@core/api/models/customer-bill-summary-model';

@Component({
  selector: 'app-bill-summary',
  standalone: false,
  templateUrl: './bill-summary.component.html',
})
export class BillSummaryComponent implements OnInit, OnDestroy {
  billData = signal<CustomerBillResponseModel | null>(null);
  splitRequested = signal(false);
  showSplitPanel = signal(false);
  splitType = signal<'Equal' | 'ByItem' | null>(null);
  numberOfPeople = signal(2);
  isSubmitting = signal(false);

  bills = computed(() => this.billData()?.bills ?? []);
  hasMultipleBills = computed(() => this.bills().length > 1);
  pendingBills = computed(() => this.bills().filter(b => b.status !== 'Paid'));
  allBillsPaid = computed(() => this.bills().length > 0 && this.bills().every(b => b.status === 'Paid'));

  groupedItems = computed(() => {
    const items = this.billData()?.items ?? [];
    const categoryOrder = [1, 2, 3];
    const grouped: CategoryGroup[] = [];

    for (const cat of categoryOrder) {
      const catItems = items.filter(i => i.categoryType === cat);
      if (catItems.length > 0) {
        grouped.push({ categoryType: cat, items: catItems });
      }
    }
    return grouped;
  });

  totalItemCount = computed(() => (this.billData()?.items ?? []).length);

  categoryBreakdown = computed(() => {
    const items = this.billData()?.items ?? [];
    const categories = [
      { type: 1, label: 'ค่าอาหาร' },
      { type: 2, label: 'ค่าเครื่องดื่ม' },
      { type: 3, label: 'ค่าของหวาน' },
    ];
    return categories
      .map(cat => ({
        label: cat.label,
        total: items
          .filter(i => i.categoryType === cat.type)
          .reduce((sum, i) => sum + (i.totalPrice ?? 0), 0),
      }))
      .filter(cat => cat.total > 0);
  });

  // Single bill (backward compat)
  currentBill = computed(() => {
    const b = this.bills();
    return b.length > 0 ? b[0] : null;
  });

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private customerService: CustomerService,
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
    private signalR: SignalRService,
    private receiptService: ReceiptService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    // Auto-refresh when SignalR sends events
    effect(() => {
      this.signalR.refreshOrders();
      this.loadBill();
    });
  }

  ngOnInit(): void {
    this.loadBill();

    // Fallback poll ทุก 15 วินาที เผื่อ SignalR หลุด
    this.pollInterval = setInterval(() => this.loadBill(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private loadBill(): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken) return;

    this.customerService.customerGetBillGet({ qrToken })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.billData.set(res.result ?? null);
        },
      });
  }

  claimBill(orderBillId: number, paymentMethod: 'Cash' | 'Transfer'): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken) return;

    this.customerService.customerClaimBillPost({
      qrToken,
      orderBillId,
      body: { paymentMethod },
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBill();
          if (paymentMethod === 'Transfer') {
            this.router.navigate(['/bill/upload'], { queryParams: { billId: orderBillId } });
          }
        },
      });
  }

  releaseBill(orderBillId: number): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken) return;

    this.customerService.customerReleaseBillPost({ qrToken, orderBillId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadBill() });
  }

  goToSlipUpload(orderBillId: number): void {
    this.router.navigate(['/bill/upload'], { queryParams: { billId: orderBillId } });
  }

  submitSplitBill(type: 'Equal' | 'ByItem'): void {
    this.isSubmitting.set(true);

    this.selfOrderService.selfOrderRequestSplitBillPost({
      body: {
        splitType: type,
        numberOfPeople: type === 'Equal' ? this.numberOfPeople() : undefined,
      },
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.splitRequested.set(true);
          this.showSplitPanel.set(false);
          this.splitType.set(null);
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  onDownloadReceipt(bill: CustomerBillSummaryModel): void {
    this.receiptService
      .downloadReceipt(bill.orderBillId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onDownloadConsolidatedReceipt(): void {
    this.receiptService
      .downloadConsolidatedReceipt()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getBillTypeLabel(billType?: string | null): string {
    switch (billType) {
      case 'ByAmount': return 'หารเท่า';
      case 'ByItem': return 'แยกตามรายการ';
      default: return '';
    }
  }

  getCategoryIcon(type: number): string {
    switch (type) {
      case 1: return 'chicken-drumstick';
      case 2: return 'drinks-glass';
      case 3: return 'dessert';
      default: return 'chicken-drumstick';
    }
  }

  getCategoryLabel(type: number): string {
    switch (type) {
      case 1: return 'อาหาร';
      case 2: return 'เครื่องดื่ม';
      case 3: return 'ของหวาน';
      default: return 'อื่นๆ';
    }
  }

  getCategoryTextClass(type: number): string {
    switch (type) {
      case 1: return 'text-primary';
      case 2: return 'text-info';
      case 3: return 'text-billing';
      default: return 'text-primary';
    }
  }

  getCategoryIconSize(type: number): string {
    switch (type) {
      case 1: return 'w-9 h-9';
      case 2: return 'w-6 h-6';
      case 3: return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  }

  getCategoryBgClass(type: number): string {
    switch (type) {
      case 1: return 'bg-primary-subtle';
      case 2: return 'bg-info-bg';
      case 3: return 'bg-billing-bg';
      default: return 'bg-primary-subtle';
    }
  }
}

interface CategoryGroup {
  categoryType: number;
  items: CustomerOrderItemModel[];
}
