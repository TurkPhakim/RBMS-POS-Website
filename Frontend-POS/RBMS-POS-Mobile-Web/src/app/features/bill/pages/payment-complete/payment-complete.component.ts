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
  templateUrl: './payment-complete.component.html',
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
