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
  template: `
    <div class="px-4">
      <!-- Animation + Waiting Text (นอกกรอบ) -->
      <div class="flex flex-col items-center text-center">
        <div class="-mb-28 flex justify-center -mt-4">
          <ng-lottie
            [options]="lottieOptions"
            width="340px"
            height="340px"
          ></ng-lottie>
        </div>
        <p class="text-xl font-semibold">พนักงานกำลังตรวจสอบรายการ</p>
        <p class="text-surface-sub text-lg mt-1 mb-4">
          กำลังคำนวณยอดรวมบิล...
        </p>
      </div>

      <!-- Order Card -->
      @if (bill()) {
        <div class="bg-white rounded-2xl border border-surface-border overflow-hidden">
          <app-card-header
            icon="checklist-cash"
            title="รายการออเดอร์"
            [subtitle]="bill()!.orderNumber ?? ''"
            gradient="primary"
          >
            <span
              cardHeaderRight
              class="relative z-10 bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap"
            >
              {{ totalItemCount() }} รายการ
            </span>
          </app-card-header>

          <!-- Grouped Order Items -->
          <div class="px-5 py-4 space-y-5">
            @for (group of groupedItems(); track group.categoryType; let isLast = $last) {
              <div>
                <div class="flex items-center mb-2">
                  <span
                    class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    [class]="getCategoryBgClass(group.categoryType)"
                  >
                    <app-generic-icon
                      [name]="getCategoryIcon(group.categoryType)"
                      [svgClass]="getCategoryIconSize(group.categoryType)"
                      [class]="getCategoryTextClass(group.categoryType)"
                    ></app-generic-icon>
                  </span>
                  <span
                    class="text-lg font-extrabold tracking-wide"
                    [class]="getCategoryTextClass(group.categoryType)"
                  >
                    {{ getCategoryLabel(group.categoryType) }}
                  </span>
                </div>
                <div class="space-y-3 pl-2">
                  @for (item of group.items; track $index) {
                    <div>
                      <div class="flex justify-between">
                        <span>{{ item.menuName }} x{{ item.quantity }}</span>
                        <span class="font-semibold shrink-0 ml-3">{{ item.totalPrice }} บาท</span>
                      </div>
                      @if (item.options && item.options.length > 0) {
                        <p class="text-sm text-surface-sub mt-0.5">
                          {{ item.options!.join(', ') }}
                        </p>
                      }
                      @if (item.note) {
                        <p class="text-sm text-surface-sub mt-0.5">{{ item.note }}</p>
                      }
                    </div>
                  }
                </div>
              </div>

              @if (!isLast) {
                <div class="border-t-2 border-dashed border-surface-border"></div>
              }
            }
          </div>

          <!-- Total -->
          <div class="bg-primary/5 border-t-2 border-primary/30 px-5 py-4 flex justify-between items-center">
            <div>
              <span class="font-bold text-lg block">ยอดรวม</span>
              <span class="text-sm text-surface-sub">(ยังไม่รวมค่าบริการ)</span>
            </div>
            <span class="text-2xl font-extrabold text-primary">{{ subTotal() }} บาท</span>
          </div>
        </div>
      }
    </div>
  `,
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
