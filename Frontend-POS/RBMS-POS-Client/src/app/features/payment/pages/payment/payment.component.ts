import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { OrdersService } from '@app/core/api/services/orders.service';
import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { CashDrawerTransactionResponseModel } from '@app/core/api/models/cash-drawer-transaction-response-model';
import { OrderResponseModel } from '@app/core/api/models/order-response-model';
import { PaymentResponseModel } from '@app/core/api/models/payment-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { VerifyPinDialogComponent } from '@app/shared/dialogs/verify-pin/verify-pin-dialog.component';
import { OpenSessionDialogComponent } from '../../dialogs/open-session-dialog/open-session-dialog.component';
import { CloseSessionDialogComponent } from '../../dialogs/close-session-dialog/close-session-dialog.component';
import { CashDrawerDialogComponent } from '../../dialogs/cash-drawer-dialog/cash-drawer-dialog.component';
import { ReceiptService } from '@app/core/services/receipt.service';
import { SlipPreviewDialogComponent } from '../../dialogs/slip-preview-dialog/slip-preview-dialog.component';
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
      .filter((t) => t.transactionType === 'CashIn')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const cashOut = txs
      .filter((t) => t.transactionType === 'CashOut')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    return (
      (session.openingCash ?? 0) +
      (session.totalCashSales ?? 0) +
      cashIn -
      cashOut
    );
  });

  paymentGroups = computed(() => {
    const payments = this.currentSession()?.payments ?? [];
    const grouped = new Map<number, PaymentResponseModel[]>();

    for (const p of payments) {
      if (!p.orderId) continue;
      if (!grouped.has(p.orderId)) grouped.set(p.orderId, []);
      grouped.get(p.orderId)!.push(p);
    }

    return Array.from(grouped.values()).map((group) => {
      const first = group[0];
      return {
        orderId: first.orderId!,
        orderNumber: first.orderNumber,
        zoneName: first.zoneName,
        tableName: first.tableName,
        guestType: first.guestType,
        guestCount: first.guestCount,
        totalGrandTotal: group.reduce((sum, p) => sum + (p.grandTotal ?? 0), 0),
        paidAt: group.reduce(
          (latest, p) =>
            !p.paidAt
              ? latest
              : !latest || p.paidAt > latest
                ? p.paidAt
                : latest,
          '' as string,
        ),
        payments: group,
        isSplit: group.length > 1,
        slipPayment: group.find(
          (p) => p.paymentMethod === 'QrPayment' && p.slipImageFileId,
        ),
      };
    });
  });

  billMenuItems: MenuItem[] = [];
  canCreateSession: boolean;
  canPayment: boolean;
  canUpdateSession: boolean;

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
    private destroyRef: DestroyRef,
  ) {
    this.canCreateSession = this.authService.hasPermission(
      'cashier-session.create',
    );
    this.canPayment = this.authService.hasPermission('payment-manage.create');
    this.canUpdateSession = this.authService.hasPermission('cashier-session.update');
  }

  ngOnInit(): void {
    this.loadCurrentSession();
    this.loadBillingOrders();
  }

  loadCurrentSession(): void {
    this.isLoading.set(true);
    this.cashierSessionsService
      .cashierSessionsGetCurrentSessionGet()
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
    this.ordersService
      .ordersGetOrdersGet({ status: 'Billing', ItemPerPage: 50 })
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
        if (result === 'success') {
          this.router.navigate(['/']);
        }
      });
  }

  onCashIn(): void {
    this.openCashDrawerDialog('cash-in');
  }

  onCashOut(): void {
    this.openCashDrawerDialog('cash-out');
  }

  onDownloadReceipt(paymentId: number): void {
    this.receiptService
      .downloadReceipt(paymentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onDownloadConsolidated(orderId: number): void {
    this.receiptService
      .downloadConsolidatedReceipt(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onViewSlip(fileId: number): void {
    this.dialogService.open(SlipPreviewDialogComponent, {
      header: 'สลิปโอนเงิน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '40vw',
      data: { fileId },
    });
  }

  buildBillMenu(group: { payments: PaymentResponseModel[] }): void {
    this.billMenuItems = group.payments.map((p) => {
      const method =
        p.paymentMethod === 'Cash'
          ? 'เงินสด'
          : p.paymentMethod === 'QrPayment'
            ? 'QR-Payment'
            : (p.paymentMethod ?? '-');
      return {
        label: `${p.billNumber} (${method})`,
        command: () => this.onDownloadReceipt(p.paymentId!),
      };
    });
  }

  onCheckout(order: OrderResponseModel): void {
    this.router.navigate(['/payment', 'checkout', order.orderId]);
  }

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  onEditTransaction(tx: CashDrawerTransactionResponseModel): void {
    const session = this.currentSession();
    if (!session) return;

    const type = tx.transactionType === 'CashIn' ? 'cash-in' : 'cash-out';
    const ref = this.dialogService.open(CashDrawerDialogComponent, {
      header: type === 'cash-in' ? 'แก้ไขเงินเข้าลิ้นชัก' : 'แก้ไขเงินออกลิ้นชัก',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
      data: { sessionId: session.cashierSessionId, type, transaction: tx },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.loadCurrentSession();
      });
  }

  onDeleteTransaction(tx: CashDrawerTransactionResponseModel): void {
    const session = this.currentSession();
    if (!session) return;

    const ref = this.modalService.info({
      title: 'ยืนยันการลบ',
      message: `ต้องการลบรายการ ${tx.transactionType === 'CashIn' ? 'เงินเข้า' : 'เงินออก'} จำนวน ${tx.amount?.toFixed(2)} บาท ใช่หรือไม่?`,
      icon: Icon.Warning,
      confirmButtonLabel: 'ลบ',
      cancelButtonLabel: 'ยกเลิก',
      onConfirm: () =>
        this.cashierSessionsService
          .cashierSessionsDeleteCashDrawerTransactionDelete({
            cashierSessionId: session.cashierSessionId!,
            cashDrawerTransactionId: tx.cashDrawerTransactionId!,
          }),
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.loadCurrentSession();
      });
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
        label: 'ปิดรอบการขาย',
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
