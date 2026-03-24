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
  template: `
    @if (bill()) {
      <div class="px-4 pt-4">
        <!-- Bill Card -->
        <div class="bg-white rounded-2xl border border-surface-border">
          <!-- Card Header -->
          <app-card-header icon="checklist-cash" title="สรุปออเดอร์" [subtitle]="bill()!.orderNumber!" gradient="primary">
            <span cardHeaderRight class="relative z-10 bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {{ totalItemCount() }} รายการ
            </span>
          </app-card-header>

          <!-- Grouped Items -->
          <div class="px-5 py-4 space-y-5">
            @for (group of groupedItems(); track group.categoryType; let isLast = $last) {
              <div>
                <div class="flex items-center mb-2">
                  <span class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    [class]="getCategoryBgClass(group.categoryType)">
                    <app-generic-icon
                      [name]="getCategoryIcon(group.categoryType)"
                      [svgClass]="getCategoryIconSize(group.categoryType)"
                      [class]="getCategoryTextClass(group.categoryType)"
                    ></app-generic-icon>
                  </span>
                  <span class="text-lg font-extrabold tracking-wide"
                    [class]="getCategoryTextClass(group.categoryType)">
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
                        <p class="text-sm text-surface-sub mt-0.5">{{ item.options!.join(', ') }}</p>
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

          <!-- Bill Charges -->
          @if (currentBill(); as b) {
            <div class="border-t-2 border-surface-border px-5 py-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span>ยอดอาหาร</span>
                <span>{{ b.subTotal }} บาท</span>
              </div>
              @if (b.serviceChargeAmount) {
                <div class="flex justify-between text-sm text-surface-sub">
                  <span>ค่าบริการ</span>
                  <span>{{ b.serviceChargeAmount }} บาท</span>
                </div>
              }
              @if (b.vatAmount) {
                <div class="flex justify-between text-sm text-surface-sub">
                  <span>ภาษีมูลค่าเพิ่ม</span>
                  <span>{{ b.vatAmount }} บาท</span>
                </div>
              }
              @if (b.totalDiscountAmount) {
                <div class="flex justify-between text-sm text-success">
                  <span>ส่วนลด</span>
                  <span>-{{ b.totalDiscountAmount }} บาท</span>
                </div>
              }
            </div>

            <!-- Grand Total -->
            <div class="bg-primary/5 border-t-2 border-primary/30 px-5 py-4 flex justify-between items-center">
              <span class="font-bold text-base sm:text-lg shrink-0">ยอดรวมสุทธิ</span>
              <span class="text-xl sm:text-2xl font-extrabold text-primary text-right">{{ b.grandTotal | number:'1.2-2' }} บาท</span>
            </div>

            <!-- Payment Buttons -->
            <div class="px-4 pb-4">
              @if (!cashRequested() && !splitRequested()) {
                <div class="relative flex gap-1.5">
                  <button pButton label="เงินสด" severity="success" class="flex-1 !text-sm !px-1 !py-1.5 sm:!py-2.5"
                          (click)="requestCashPayment()"></button>
                  <button pButton label="โอนเงิน" class="flex-1 !text-sm !px-1 !py-1.5 sm:!py-2.5"
                          (click)="goToSlipUpload(b.orderBillId!)"></button>
                  <div class="flex-1">
                    <button pButton severity="info" class="w-full !p-0 !overflow-hidden h-full"
                            (click)="showSplitPanel.set(!showSplitPanel())">
                      <span class="flex items-center w-full h-full">
                        <span class="flex-1 px-1 text-center text-sm leading-tight whitespace-nowrap">แยกบิล</span>
                        <span class="border-l border-white/30 px-2 flex items-center justify-center self-stretch">
                          <i class="pi pi-chevron-down text-xs transition-transform duration-200"
                             [class.rotate-180]="showSplitPanel()"></i>
                        </span>
                      </span>
                    </button>
                  </div>

                  @if (showSplitPanel()) {
                    <div class="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-lg border border-surface-border overflow-hidden">
                        @if (splitType() !== 'Equal') {
                          <button class="w-full text-left px-4 py-3 hover:bg-info/5 transition-colors border-b border-surface-border font-medium"
                                  (click)="splitType.set('Equal')">
                            หารเท่า
                          </button>
                          <button class="w-full text-left px-4 py-3 hover:bg-info/5 transition-colors font-medium"
                                  (click)="submitSplitBill('ByItem')">
                            แยกตามรายการ
                          </button>
                        } @else {
                          <div class="p-3 space-y-2">
                            <p class="text-base font-semibold text-info">หารเท่า</p>
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <div class="flex items-center justify-center gap-2">
                                <button pButton icon="pi pi-minus" [rounded]="true" severity="info" [outlined]="true" size="small"
                                        [disabled]="numberOfPeople() <= 2"
                                        (click)="numberOfPeople.set(numberOfPeople() - 1)"></button>
                                <span class="text-2xl font-bold w-8 text-center">{{ numberOfPeople() }}</span>
                                <button pButton icon="pi pi-plus" [rounded]="true" severity="info" [outlined]="true" size="small"
                                        (click)="numberOfPeople.set(numberOfPeople() + 1)"></button>
                              </div>
                              <p class="text-sm text-surface-sub text-center sm:text-right">คนละ <span class="font-semibold text-info">~{{ (b.grandTotal! / numberOfPeople()) | number:'1.2-2' }}</span> บาท</p>
                            </div>
                            <div class="flex gap-2">
                              <button pButton label="กลับ" severity="secondary" [outlined]="true" size="small" class="flex-1"
                                      (click)="splitType.set(null)"></button>
                              <button pButton label="ยืนยัน" severity="info" size="small" class="flex-[2]"
                                      [loading]="isSubmitting()"
                                      (click)="submitSplitBill('Equal')"></button>
                            </div>
                          </div>
                        }
                    </div>
                  }
                </div>
              } @else if (cashRequested()) {
                <div class="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2">
                  <span class="w-18 h-18 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <app-generic-icon name="bill-invoice" svgClass="w-12 h-12" class="text-success"></app-generic-icon>
                  </span>
                  <div>
                    <p class="text-xl font-bold text-success">แจ้งพนักงานแล้ว</p>
                    <p class="text-surface-sub mt-1">กรุณาชำระเงินที่เคาน์เตอร์ หรือรอพนักงานมารับเงินที่โต๊ะ</p>
                  </div>
                </div>
              } @else if (splitRequested()) {
                <div class="bg-info/5 border border-info/30 rounded-xl p-3 flex items-center gap-2">
                  <span class="w-18 h-18 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                    <app-generic-icon name="bill-invoice" svgClass="w-12 h-12" class="text-info"></app-generic-icon>
                  </span>
                  <div>
                    <p class="text-xl font-bold text-info">แจ้งพนักงานแล้ว</p>
                    <p class="text-surface-sub mt-1">กรุณารอพนักงานมาแยกบิลชำระเงินให้ที่โต๊ะ</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
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
