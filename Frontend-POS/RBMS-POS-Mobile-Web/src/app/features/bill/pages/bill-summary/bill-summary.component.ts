import { Component, computed, DestroyRef, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerService } from '@core/api/services/customer.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { CustomerBillResponseModel } from '@core/api/models/customer-bill-response-model';
import { CustomerOrderItemModel } from '@core/api/models/customer-order-item-model';

@Component({
  selector: 'app-bill-summary',
  standalone: false,
  templateUrl: './bill-summary.component.html',
})
export class BillSummaryComponent implements OnInit {
  bill = signal<CustomerBillResponseModel | null>(null);
  cashRequested = signal(false);
  splitRequested = signal(false);
  showSplitPanel = signal(false);
  splitType = signal<'Equal' | 'ByItem' | null>(null);
  numberOfPeople = signal(2);
  isSubmitting = signal(false);

  groupedItems = computed(() => {
    const items = this.bill()?.items ?? [];
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

  totalItemCount = computed(() => (this.bill()?.items ?? []).length);

  categoryBreakdown = computed(() => {
    const items = this.bill()?.items ?? [];
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

  currentBill = computed(() => {
    const bills = this.bill()?.bills ?? [];
    return bills.length > 0 ? bills[0] : null;
  });

  constructor(
    private customerService: CustomerService,
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken) return;

    // Restore payment request state from sessionStorage
    const savedState = sessionStorage.getItem(`bill_state_${qrToken}`);
    if (savedState === 'cash') this.cashRequested.set(true);
    if (savedState === 'split') this.splitRequested.set(true);

    this.customerService.customerGetBillGet({ qrToken })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.bill.set(res.result ?? null);
        },
      });
  }

  goToSlipUpload(orderBillId: number): void {
    this.router.navigate(['/bill/upload'], { queryParams: { billId: orderBillId } });
  }

  requestCashPayment(): void {
    this.selfOrderService.selfOrderRequestCashPaymentPost()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cashRequested.set(true);
          const qrToken = this.customerAuth.getQrToken();
          if (qrToken) sessionStorage.setItem(`bill_state_${qrToken}`, 'cash');
        },
      });
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
          const qrToken = this.customerAuth.getQrToken();
          if (qrToken) sessionStorage.setItem(`bill_state_${qrToken}`, 'split');
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
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
      case 1: return 'bg-primary/10';
      case 2: return 'bg-info/10';
      case 3: return 'bg-billing/10';
      default: return 'bg-primary/10';
    }
  }
}

interface CategoryGroup {
  categoryType: number;
  items: CustomerOrderItemModel[];
}
