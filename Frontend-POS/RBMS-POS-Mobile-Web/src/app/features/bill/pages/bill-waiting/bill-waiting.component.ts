import { Component, computed, DestroyRef, effect, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { CustomerService } from '@core/api/services/customer.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { SignalRService } from '@core/services/signalr.service';
import { CustomerBillResponseModel } from '@core/api/models/customer-bill-response-model';
import { CustomerOrderItemModel } from '@core/api/models/customer-order-item-model';

@Component({
  selector: 'app-bill-waiting',
  standalone: false,
  templateUrl: './bill-waiting.component.html',
})
export class BillWaitingComponent implements OnInit {
  lottieOptions: AnimationOptions = {
    path: 'animations/bill-waiting.json',
  };

  bill = signal<CustomerBillResponseModel | null>(null);
  private billReady = signal(false);

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

  subTotal = computed(() => {
    const items = this.bill()?.items ?? [];
    return items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  });

  constructor(
    private customerService: CustomerService,
    private customerAuth: CustomerAuthService,
    private signalR: SignalRService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    effect(() => {
      this.signalR.refreshOrders();
      if (this.billReady()) return;
      this.loadBillData();
    });
  }

  ngOnInit(): void {
    this.loadBillData();
  }

  private loadBillData(): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken) return;

    this.customerService.customerGetBillGet({ qrToken })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.bill.set(res.result);
          }
          if (res.result?.bills && res.result.bills.length > 0) {
            this.billReady.set(true);
            this.router.navigate(['/bill/summary'], { replaceUrl: true });
          }
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
