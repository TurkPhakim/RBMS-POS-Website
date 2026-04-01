import { Component, DestroyRef, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { CustomerService } from '@core/api/services/customer.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ReceiptDataModel } from '@core/api/models/receipt-data-model';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { ReceiptService } from '@core/services/receipt.service';
import { SignalRService } from '@core/services/signalr.service';

const POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-payment-complete',
  standalone: false,
  templateUrl: './payment-complete.component.html',
})
export class PaymentCompleteComponent implements OnInit, OnDestroy {
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

  paymentMethod = '';

  private orderBillId: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

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
    this.paymentMethod = this.route.snapshot.queryParamMap.get('method') ?? '';
    this.shopName = this.customerAuth.getSession()?.shopNameThai ?? '';

    // Mark billId as seen เพื่อป้องกัน bill-summary redirect วนลูป
    if (this.orderBillId) {
      const seenBills: number[] = JSON.parse(
        sessionStorage.getItem('seen_paid_bills') || '[]',
      );
      if (!seenBills.includes(this.orderBillId)) {
        seenBills.push(this.orderBillId);
        sessionStorage.setItem('seen_paid_bills', JSON.stringify(seenBills));
      }
    }

    // Immediate poll on SignalR events
    effect(() => {
      this.signalR.refreshOrders();
      if (!this.isCompleted()) this.checkStatus();
    });
  }

  ngOnInit(): void {
    this.checkStatus();
    this.startPolling();
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', this.blockBack);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    window.removeEventListener('popstate', this.blockBack);
  }

  private blockBack = (): void => {
    history.pushState(null, '', location.href);
  };

  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      if (!this.isCompleted()) this.checkStatus();
      else this.stopPolling();
    }, POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
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
    if (!this.orderBillId) return;

    // ใช้ qrToken จาก localStorage หรือ '-' เป็น fallback
    // Backend ไม่ validate QR token สำหรับ endpoint นี้แล้ว (ใช้แค่ orderBillId)
    const qrToken = this.customerAuth.getQrToken() ?? '-';

    this.customerService
      .customerGetPaymentStatusGet({
        qrToken,
        orderBillId: this.orderBillId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result === 'Paid') {
            this.isCompleted.set(true);
            this.stopPolling();
            this.loadReceiptData();
          }
        },
        error: () => {
          // ไม่ต้องทำอะไร — ให้ poll ครั้งถัดไปลองใหม่
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
