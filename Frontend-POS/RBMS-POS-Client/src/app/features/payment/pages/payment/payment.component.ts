import { Component, computed, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ApiConfiguration } from '@app/core/api/api-configuration';

import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { OrdersService } from '@app/core/api/services/orders.service';
import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { OrderResponseModel } from '@app/core/api/models/order-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { VerifyPinDialogComponent } from '@app/shared/dialogs/verify-pin/verify-pin-dialog.component';
import { OpenSessionDialogComponent } from '../../dialogs/open-session-dialog/open-session-dialog.component';
import { CloseSessionDialogComponent } from '../../dialogs/close-session-dialog/close-session-dialog.component';
import { CashDrawerDialogComponent } from '../../dialogs/cash-drawer-dialog/cash-drawer-dialog.component';
import { CashPaymentDialogComponent } from '../../dialogs/cash-payment-dialog/cash-payment-dialog.component';
import { QrPaymentDialogComponent } from '../../dialogs/qr-payment-dialog/qr-payment-dialog.component';
import { ReceiptService } from '@app/core/services/receipt.service';

const KEY_BTN_CLOSE = 'close-session';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  providers: [DialogService],
})

export class PaymentComponent implements OnInit, OnDestroy {
  currentSession = signal<CashierSessionResponseModel | null>(null);
  billingOrders = signal<OrderResponseModel[]>([]);
  isLoading = signal(false);
  hasSession = signal(false);

  calculatedExpectedCash = computed(() => {
    const session = this.currentSession();
    if (!session) return 0;
    const txs = session.cashDrawerTransactions ?? [];
    const cashIn = txs
      .filter(t => t.transactionType === 'CashIn')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const cashOut = txs
      .filter(t => t.transactionType === 'CashOut')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    return (session.openingCash ?? 0) + (session.totalCashSales ?? 0) + cashIn - cashOut;
  });

  downloadingId = signal<number | null>(null);
  canCreateSession: boolean;
  canPayment: boolean;

  constructor(
    private cashierSessionsService: CashierSessionsService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private dialogService: DialogService,
    private modalService: ModalService,
    private breadcrumbService: BreadcrumbService,
    private receiptService: ReceiptService,
    private apiConfig: ApiConfiguration,
    private router: Router,
    private destroyRef: DestroyRef
  ) {
    this.canCreateSession = this.authService.hasPermission('cashier-session.create');
    this.canPayment = this.authService.hasPermission('payment-manage.create');
  }

  ngOnInit(): void {
    this.loadCurrentSession();
    this.loadBillingOrders();
  }

  loadCurrentSession(): void {
    this.isLoading.set(true);
    this.cashierSessionsService.cashierSessionsGetCurrentSessionGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.currentSession.set(res.result ?? null);
          this.hasSession.set(!!res.result);
          this.isLoading.set(false);

          if (res.result) {
            this.setupBreadcrumbButtons();
          } else {
            this.breadcrumbService.clearButtons();
            if (this.canCreateSession) {
              this.promptOpenSession();
            }
          }
        },
        error: () => this.isLoading.set(false),
      });
  }

  loadBillingOrders(): void {
    this.ordersService.ordersGetOrdersGet({ status: 'Billing', ItemPerPage: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.billingOrders.set(res.results ?? []),
      });
  }

  private async promptOpenSession(): Promise<void> {
    const confirmed = await this.modalService.infoAsync({
      title: 'ยังไม่ได้เปิดรอบการขาย',
      message: 'ต้องการเปิดรอบการขายหรือไม่?',
      icon: Icon.Question,
      confirmButtonLabel: 'เปิดรอบ',
      cancelButtonLabel: 'ยกเลิก',
    });

    if (!confirmed) {
      this.router.navigate(['/']);
      return;
    }

    const pinRef = this.dialogService.open(VerifyPinDialogComponent, {
      header: 'ยืนยันตัวตน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
    });

    pinRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === true) {
          this.openSessionDialog();
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  private openSessionDialog(): void {
    const ref = this.dialogService.open(OpenSessionDialogComponent, {
      header: 'เปิดรอบการขาย',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadCurrentSession();
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  onCloseSession(): void {
    const session = this.currentSession();
    if (!session) return;

    const ref = this.dialogService.open(CloseSessionDialogComponent, {
      header: 'ปิดรอบการขาย',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '40vw',
      data: { session },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.loadCurrentSession();
      });
  }

  onCashIn(): void {
    this.openCashDrawerDialog('cash-in');
  }

  onCashOut(): void {
    this.openCashDrawerDialog('cash-out');
  }

  onPayCash(order: OrderResponseModel): void {
    const ref = this.dialogService.open(CashPaymentDialogComponent, {
      header: 'ชำระเงินสด',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '50vw',
      data: { orderId: order.orderId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadCurrentSession();
          this.loadBillingOrders();
        }
      });
  }

  onPayQr(order: OrderResponseModel): void {
    const ref = this.dialogService.open(QrPaymentDialogComponent, {
      header: 'ชำระเงิน QR / สลิป',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '50vw',
      data: { orderId: order.orderId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadCurrentSession();
          this.loadBillingOrders();
        }
      });
  }

  onDownloadReceipt(paymentId: number): void {
    this.downloadingId.set(paymentId);
    this.receiptService.downloadReceipt(paymentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.downloadingId.set(null),
        error: () => this.downloadingId.set(null),
      });
  }

  onCheckout(order: OrderResponseModel): void {
    this.router.navigate(['/payment', 'checkout', order.orderId]);
  }

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_CLOSE,
      type: 'button',
      item: {
        key: KEY_BTN_CLOSE,
        label: 'ปิดรอบ',
        severity: 'danger',
        callback: () => this.onCloseSession(),
      },
    });
  }

  private openCashDrawerDialog(type: 'cash-in' | 'cash-out'): void {
    const session = this.currentSession();
    if (!session) return;

    const ref = this.dialogService.open(CashDrawerDialogComponent, {
      header: type === 'cash-in' ? 'เงินเข้าลิ้นชัก' : 'เงินออกลิ้นชัก',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
      data: { sessionId: session.cashierSessionId, type },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.loadCurrentSession();
      });
  }
}
