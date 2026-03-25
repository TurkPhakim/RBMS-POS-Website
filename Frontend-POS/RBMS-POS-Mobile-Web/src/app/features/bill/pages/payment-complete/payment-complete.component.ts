import { Component, DestroyRef, effect, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { CustomerService } from '@core/api/services/customer.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ReceiptDataModel } from '@core/api/models/receipt-data-model';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { ReceiptService } from '@core/services/receipt.service';
import { SignalRService } from '@core/services/signalr.service';

@Component({
  selector: 'app-payment-complete',
  standalone: false,
  template: `
    @if (isCompleted()) {
      <div class="flex flex-col items-center px-4 text-center">
        <div class="-mb-2 flex justify-center">
          <ng-lottie
            [options]="successLottie"
            width="200px"
            height="200px"
          ></ng-lottie>
        </div>
        <p class="text-2xl font-bold text-success">ชำระเงินเรียบร้อย</p>
        <p class="text-surface-sub mt-2 text-lg">
          ขอบคุณที่ใช้บริการ {{ shopName }}
        </p>

        <!-- Receipt Summary -->
        @if (receipt()) {
          <div
            class="mt-8 bg-white rounded-2xl text-left w-full border border-surface-border overflow-hidden"
          >
            <app-card-header
              icon="checklist-cash"
              title="ใบเสร็จชำระเงิน"
              gradient="success"
            ></app-card-header>
            <div class="px-5 py-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-surface-sub">หมายเลขออเดอร์</span>
                <span class="font-medium">{{ receipt()!.orderNumber }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-surface-sub">โซน - โต๊ะ</span>
                <span class="font-medium">{{ receipt()!.tableName }}</span>
              </div>
              @if (receipt()!.billType === 'ByAmount') {
                <div class="flex justify-between text-sm">
                  <span class="text-surface-sub">ประเภท</span>
                  <span class="font-medium">หารเท่า {{ receipt()!.splitCount }} ส่วน</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-surface-sub">ส่วนที่</span>
                  <span class="font-medium">{{ receipt()!.splitIndex }} จาก {{ receipt()!.splitCount }}</span>
                </div>
              } @else {
                <div class="flex justify-between text-sm">
                  <span class="text-surface-sub">จำนวนรายการ</span>
                  <span class="font-medium">{{ receipt()!.items?.length ?? 0 }} รายการ</span>
                </div>
              }
              <div class="flex justify-between text-sm">
                <span class="text-surface-sub">วิธีการชำระเงิน</span>
                <span class="font-medium">{{ paymentMethodLabel() }}</span>
              </div>
              <div
                class="border-t border-surface-border pt-2 mt-2 flex justify-between font-semibold"
              >
                <span>ยอดรวมสุทธิ</span>
                <span class="text-primary text-lg"
                  >{{ formatCurrency(receipt()!.grandTotal) }} บาท</span
                >
              </div>
            </div>
            <!-- Download Receipt Button -->
            <div class="px-5 pb-4">
              <button
                pButton
                [label]="downloaded() ? 'ดาวน์โหลดแล้ว' : 'ดาวน์โหลดใบเสร็จ'"
                severity="secondary"
                [outlined]="!downloaded()"
                class="w-full"
                [class.!bg-primary]="downloaded()"
                [class.!border-primary]="downloaded()"
                [class.!text-white]="downloaded()"
                (click)="onDownloadReceipt()"
              >
                <app-generic-icon
                  name="download"
                  svgClass="w-6 h-6"
                ></app-generic-icon>
              </button>
            </div>
          </div>
        }
      </div>
    } @else {
      <div
        class="flex-1 flex flex-col items-center justify-center text-center px-6"
      >
        <div class="-mb-24 flex justify-center">
          <ng-lottie
            [options]="waitingLottie"
            width="400px"
            height="400px"
          ></ng-lottie>
        </div>
        <p class="text-2xl font-semibold">รอการยืนยันชำระเงิน</p>
        <p class="text-surface-sub text-lg mt-1">พนักงานกำลังตรวจสอบสลิป</p>
      </div>
    }
  `,
})
export class PaymentCompleteComponent {
  isCompleted = signal(false);
  receipt = signal<ReceiptDataModel | null>(null);
  downloaded = signal(false);

  shopName = '';

  waitingLottie: AnimationOptions = {
    path: 'animations/walking-orange.json',
  };

  successLottie: AnimationOptions = {
    path: 'animations/success.json',
  };

  private orderBillId: number;

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
    private receiptService: ReceiptService,
    private signalR: SignalRService,
    private destroyRef: DestroyRef,
  ) {
    this.orderBillId = Number(this.route.snapshot.queryParamMap.get('billId'));
    this.shopName = this.customerAuth.getSession()?.shopNameThai ?? '';

    // Poll on SignalR events
    effect(() => {
      this.signalR.refreshOrders();
      if (!this.isCompleted()) this.checkStatus();
    });
  }

  paymentMethodLabel(): string {
    const method = this.receipt()?.paymentMethod;
    if (method === 'Cash') return 'เงินสด';
    if (method === 'QrCode') return 'โอนเงิน';
    return method ?? '-';
  }

  formatCurrency(value?: number | null): string {
    if (value == null) return '0.00';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onDownloadReceipt(): void {
    if (!this.orderBillId) return;
    this.receiptService
      .downloadReceipt(this.orderBillId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.downloaded.set(true));
  }

  private checkStatus(): void {
    const qrToken = this.customerAuth.getQrToken();
    if (!qrToken || !this.orderBillId) return;

    this.customerService
      .customerGetPaymentStatusGet({
        qrToken,
        orderBillId: this.orderBillId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result === 'Completed') {
            this.isCompleted.set(true);
            this.loadReceiptData();
          }
        },
      });
  }

  private loadReceiptData(): void {
    this.selfOrderService
      .selfOrderGetReceiptGet({ orderBillId: this.orderBillId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result) this.receipt.set(res.result);
        },
      });
  }
}
