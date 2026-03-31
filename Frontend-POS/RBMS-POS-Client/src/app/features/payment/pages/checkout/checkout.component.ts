import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { AnimationOptions } from 'ngx-lottie';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { OrdersService } from '@app/core/api/services/orders.service';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { OrderDetailResponseModel } from '@app/core/api/models/order-detail-response-model';
import { OrderLinkedTableModel } from '@app/core/api/models/order-linked-table-model';
import { OrderBillResponseModel } from '@app/core/api/models/order-bill-response-model';
import { PaymentResponseModel } from '@app/core/api/models/payment-response-model';
import { ModalService, Icon } from '@app/core/services/modal.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { OrderHubService } from '@app/core/services/order-hub.service';
import { ReceiptService } from '@app/core/services/receipt.service';
import { QrPaymentDialogComponent } from '../../dialogs/qr-payment-dialog/qr-payment-dialog.component';
import { SplitBillDialogComponent } from '@app/shared/dialogs/split-bill-dialog/split-bill-dialog.component';
import { SlipPreviewDialogComponent } from '../../dialogs/slip-preview-dialog/slip-preview-dialog.component';

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
const KEY_BTN_BACK = 'checkout-back';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  providers: [DialogService],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  billPaidLottie: AnimationOptions = { path: 'animations/bill-waiting.json' };
  allPaidLottie: AnimationOptions = { path: 'animations/success.json' };
  orderDetail = signal<OrderDetailResponseModel | null>(null);
  allBills = signal<OrderBillResponseModel[]>([]);
  selectedBillIndex = signal(0);
  selectedScId = signal<number | null>(null);
  payments = signal<PaymentResponseModel[]>([]);
  isSaving = signal(false);
  isUpdatingSc = signal(false);
  billSentToCustomer = signal(false);

  numpadDisplay = signal('0');
  numpadKeys = NUMPAD_KEYS;

  currentBill = computed(() => {
    const bills = this.allBills();
    const idx = this.selectedBillIndex();
    return bills[idx] ?? null;
  });

  allBillsPaid = computed(() => {
    const bills = this.allBills();
    return bills.length > 0 && bills.every((b) => b.status === 'Paid');
  });

  canUnsplit = computed(() => {
    const bills = this.allBills();
    return bills.length > 1 && bills.every((b) => b.status === 'Pending');
  });

  hasAnyPaidBill = computed(() => {
    return this.allBills().some((b) => b.status === 'Paid');
  });

  amountReceived = computed(() => {
    const val = parseFloat(this.numpadDisplay());
    return isNaN(val) ? 0 : val;
  });

  changeAmount = computed(() => {
    const bill = this.currentBill();
    if (!bill) return 0;
    return Math.max(0, this.amountReceived() - (bill.grandTotal ?? 0));
  });

  activeItems = computed(() => {
    const detail = this.orderDetail();
    if (!detail?.items) return [];
    return detail.items.filter(
      (i) => i.status !== 'Cancelled' && i.status !== 'Voided',
    );
  });

  categoryBreakdown = computed(() => {
    const items = this.activeItems();
    const categories = [
      { type: 1, label: 'ค่าอาหาร' },
      { type: 2, label: 'ค่าเครื่องดื่ม' },
      { type: 3, label: 'ค่าของหวาน' },
    ];
    return categories
      .map((cat) => ({
        label: cat.label,
        total: items
          .filter((i) => i.categoryType === cat.type)
          .reduce((sum, i) => sum + (i.totalPrice ?? 0), 0),
      }))
      .filter((cat) => cat.total > 0);
  });

  itemsBySourceTable = computed(() => {
    const items = this.activeItems();
    const order = this.orderDetail();
    if (!order?.isLinked) return [];

    const groups = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.sourceTableName ?? order.tableName ?? '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }

    return Array.from(groups.entries()).map(([tableName, tableItems]) => ({
      tableName,
      items: tableItems,
      subtotal: tableItems.reduce((sum, i) => sum + (i.totalPrice ?? 0), 0),
    }));
  });

  private orderId = 0;
  private pendingAutoOpenSlip = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiConfig: ApiConfiguration,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private dialogService: DialogService,
    private modalService: ModalService,
    private breadcrumbService: BreadcrumbService,
    private orderHubService: OrderHubService,
    private receiptService: ReceiptService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.params['orderId']);
    this.pendingAutoOpenSlip = this.route.snapshot.queryParams['openSlip'] === 'true';
    this.setupBreadcrumbButtons();
    this.loadData();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
    this.orderHubService.leaveGroup('floor');
  }

  private connectSignalR(): void {
    this.orderHubService.start('floor');
    this.orderHubService.slipUploaded$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData());
    this.orderHubService.paymentCompleted$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadData());
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.goBack(),
      },
    });
  }

  getImageUrl(fileId: number | null | undefined): string | null {
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  }

  private loadData(): void {
    this.ordersService
      .ordersGetOrderGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.orderDetail.set(res.result ?? null),
      });

    this.loadBills();
  }

  private loadBills(): void {
    this.ordersService
      .ordersGetBillsGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const bills = res.result ?? [];
          if (bills.length === 0) {
            this.autoCreateBill();
            return;
          }
          this.allBills.set(bills);
          this.autoSelectPendingBill(bills);
          this.syncScDropdown();

          if (this.pendingAutoOpenSlip) {
            this.pendingAutoOpenSlip = false;
            setTimeout(() => this.onPayQr());
          }
        },
      });

    this.paymentsService
      .paymentsGetByOrderGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.payments.set(res.result ?? []),
      });
  }

  private autoCreateBill(): void {
    const detail = this.orderDetail();
    const unservedItems = (detail?.items ?? []).filter(
      (i) =>
        i.status !== 'Served' &&
        i.status !== 'Voided' &&
        i.status !== 'Cancelled',
    );

    if (unservedItems.length > 0) {
      this.modalService
        .info({
          title: 'รายการยังเสิร์ฟไม่ครบ',
          message: `มี ${unservedItems.length} รายการที่ยังไม่เสิร์ฟ\nต้องการสร้างบิลจากเฉพาะรายการที่เสิร์ฟแล้วหรือไม่?`,
          icon: Icon.Warning,
          confirmButtonLabel: 'สร้างบิล',
        })
        .onClose.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((confirmed) => {
          if (confirmed) this.createBill(true);
        });
      return;
    }

    this.createBill(false);
  }

  private createBill(force: boolean): void {
    this.ordersService
      .ordersRequestBillPost({ orderId: this.orderId, force })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadBills(),
        error: () => {
          this.modalService.cancel({
            title: 'ไม่สามารถสร้างบิลได้',
            message: 'กรุณาตรวจสอบว่ามีรายการ\nที่เสิร์ฟแล้วอย่างน้อย 1 รายการ',
          });
        },
      });
  }

  private autoSelectPendingBill(bills: OrderBillResponseModel[]): void {
    const pendingIdx = bills.findIndex((b) => b.status === 'Pending');
    this.selectedBillIndex.set(pendingIdx >= 0 ? pendingIdx : 0);
    this.numpadDisplay.set('0');
  }

  private syncScDropdown(): void {
    const bill = this.currentBill();
    this.selectedScId.set(bill?.serviceChargeId ?? null);
  }

  onSelectBill(index: number): void {
    this.selectedBillIndex.set(index);
    this.numpadDisplay.set('0');
    this.syncScDropdown();
  }

  onScChange(scId: number | null): void {
    const bill = this.currentBill();
    if (!bill) return;

    this.selectedScId.set(scId);
    this.isUpdatingSc.set(true);

    this.ordersService
      .ordersUpdateBillChargesPut({
        orderBillId: bill.orderBillId!,
        body: { serviceChargeId: scId },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBills();
          this.isUpdatingSc.set(false);
        },
        error: () => this.isUpdatingSc.set(false),
      });
  }

  onNumpadPress(key: string): void {
    const current = this.numpadDisplay();

    if (key === 'C') {
      this.numpadDisplay.set('0');
      return;
    }

    if (key === 'backspace') {
      if (current.length <= 1) {
        this.numpadDisplay.set('0');
      } else {
        this.numpadDisplay.set(current.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (current.includes('.')) return;
      this.numpadDisplay.set(current + '.');
      return;
    }

    if (current.includes('.')) {
      const decimals = current.split('.')[1];
      if (decimals && decimals.length >= 2) return;
    }

    if (current === '0' && key !== '.') {
      this.numpadDisplay.set(key);
    } else {
      this.numpadDisplay.set(current + key);
    }
  }

  onSetExactAmount(): void {
    const bill = this.currentBill();
    if (!bill) return;
    this.numpadDisplay.set((bill.grandTotal ?? 0).toFixed(2));
  }

  onPayCash(): void {
    const bill = this.currentBill();
    if (!bill || bill.status === 'Paid') return;

    const amount = this.amountReceived();
    const grandTotal = bill.grandTotal ?? 0;

    if (amount < grandTotal) {
      this.modalService.cancel({
        title: 'จำนวนเงินไม่พอ',
        message: `จำนวนเงินที่รับ (${amount.toFixed(2)}) น้อยกว่ายอดบิล (${grandTotal.toFixed(2)})`,
      });
      return;
    }

    this.isSaving.set(true);
    this.paymentsService
      .paymentsPayCashPost({
        body: {
          orderBillId: bill.orderBillId!,
          amountReceived: amount,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          const paymentId = res.result?.paymentId;
          const change = this.changeAmount();

          const dialogRef = this.modalService.success({
            title: 'ชำระเงินสำเร็จ',
            message:
              change > 0 ? `เงินทอน ${change.toFixed(2)} บาท` : undefined,
            confirmButtonLabel: 'ดาวน์โหลดใบเสร็จ',
            onConfirm: () =>
              paymentId
                ? this.receiptService.downloadReceipt(paymentId)
                : undefined,
          });

          dialogRef.onClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.afterPayment());
        },
        error: () => this.isSaving.set(false),
      });
  }

  onPayQr(): void {
    const bill = this.currentBill();
    if (!bill || bill.status === 'Paid') return;

    const ref = this.dialogService.open(QrPaymentDialogComponent, {
      header: 'ชำระเงิน QR / สลิป',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '50vw',
      data: { orderId: this.orderId, orderBillId: bill.orderBillId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.afterPayment();
      });
  }

  onVoidBill(): void {
    this.modalService.info({
      title: 'ยกเลิกบิล',
      message: 'ต้องการยกเลิกบิลและกลับไปหน้าออเดอร์หรือไม่?',
      onConfirm: () => {
        this.ordersService
          .ordersVoidBillPost({ orderId: this.orderId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.router.navigate(['/order', 'list', this.orderId]);
            },
          });
      },
    });
  }

  onUnsplitBill(): void {
    this.modalService.info({
      title: 'ยกเลิกการแยกบิล',
      message: 'ต้องการรวมบิลกลับเป็นบิลเดียวหรือไม่?',
      onConfirm: () => {
        this.ordersService
          .ordersUnsplitBillPost({ orderId: this.orderId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadBills();
            },
          });
      },
    });
  }

  onSplitBill(): void {
    const order = this.orderDetail();
    if (!order) return;

    const ref = this.dialogService.open(SplitBillDialogComponent, {
      header: 'แยกบิลชำระเงิน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '55vw',
      data: { items: order.items },
    });

    ref.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (
        result:
          | {
              mode: string;
              numberOfSplits?: number;
              groups?: { orderItemIds: number[] }[];
            }
          | undefined,
      ) => {
        if (!result) return;
        const apiCall =
          result.mode === 'by-amount'
            ? this.ordersService.ordersSplitByAmountPost({
                orderId: this.orderId,
                body: { numberOfSplits: result.numberOfSplits! },
              })
            : this.ordersService.ordersSplitByItemPost({
                orderId: this.orderId,
                body: { groups: result.groups! },
              });

        apiCall.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.modalService.commonSuccess();
            this.loadBills();
          },
          error: () => {
            this.modalService.cancel({
              title: 'แยกบิลไม่สำเร็จ',
              message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
            });
          },
        });
      },
    );
  }

  getSlipUrl(bill: OrderBillResponseModel): string | null {
    const payment = this.payments().find(
      (p) => p.orderBillId === bill.orderBillId,
    );
    if (!payment?.slipImageFileId) return null;
    return `${this.apiConfig.rootUrl}/api/admin/file/${payment.slipImageFileId}`;
  }

  onViewSlip(bill: OrderBillResponseModel): void {
    const payment = this.payments().find(
      (p) => p.orderBillId === bill.orderBillId,
    );
    if (!payment?.slipImageFileId) return;
    this.dialogService.open(SlipPreviewDialogComponent, {
      header: 'สลิปโอนเงิน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '40vw',
      data: { fileId: payment.slipImageFileId },
    });
  }

  onDownloadBillReceipt(bill: OrderBillResponseModel): void {
    const payment = this.payments().find(
      (p) => p.orderBillId === bill.orderBillId,
    );
    if (!payment) return;
    this.receiptService
      .downloadReceipt(payment.paymentId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onDownloadConsolidatedReceipt(): void {
    this.receiptService
      .downloadConsolidatedReceipt(this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private afterPayment(): void {
    this.ordersService
      .ordersGetBillsGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const bills = res.result ?? [];
          const allPaid =
            bills.length > 0 && bills.every((b) => b.status === 'Paid');
          if (allPaid) {
            this.allBills.set(bills);
          } else {
            this.allBills.set(bills);
            this.autoSelectPendingBill(bills);
            this.syncScDropdown();
            this.paymentsService
              .paymentsGetByOrderGet({ orderId: this.orderId })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({ next: (pr) => this.payments.set(pr.result ?? []) });
          }
        },
      });
  }

  getSecondaryTables(o: OrderDetailResponseModel): OrderLinkedTableModel[] {
    return (o.linkedTables ?? []).filter((lt) => !lt.isPrimary);
  }

  onSendBillToCustomer(): void {
    this.ordersService
      .ordersSendBillToCustomerPost({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.billSentToCustomer.set(true);
          this.modalService.commonSuccess();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/payment']);
  }
}
