import { Component, DestroyRef, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { OrdersService } from '@app/core/api/services/orders.service';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { OrderDetailResponseModel } from '@app/core/api/models/order-detail-response-model';
import { OrderBillResponseModel } from '@app/core/api/models/order-bill-response-model';
import { ServiceChargeOptionModel } from '@app/core/api/models/service-charge-option-model';
import { ModalService } from '@app/core/services/modal.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ReceiptService } from '@app/core/services/receipt.service';
import { QrPaymentDialogComponent } from '../../dialogs/qr-payment-dialog/qr-payment-dialog.component';
import { SplitBillDialogComponent } from '@app/shared/dialogs/split-bill-dialog/split-bill-dialog.component';

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
const KEY_BTN_BACK = 'checkout-back';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  providers: [DialogService],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  orderDetail = signal<OrderDetailResponseModel | null>(null);
  allBills = signal<OrderBillResponseModel[]>([]);
  selectedBillIndex = signal(0);
  scOptions = signal<ServiceChargeOptionModel[]>([]);
  selectedScId = signal<number | null>(null);
  isSaving = signal(false);
  isUpdatingSc = signal(false);

  numpadDisplay = signal('0');
  numpadKeys = NUMPAD_KEYS;

  currentBill = computed(() => {
    const bills = this.allBills();
    const idx = this.selectedBillIndex();
    return bills[idx] ?? null;
  });

  allBillsPaid = computed(() => {
    const bills = this.allBills();
    return bills.length > 0 && bills.every(b => b.status === 'Paid');
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
    return detail.items.filter(i => i.status !== 'Cancelled' && i.status !== 'Voided');
  });

  private orderId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiConfig: ApiConfiguration,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private dialogService: DialogService,
    private modalService: ModalService,
    private breadcrumbService: BreadcrumbService,
    private receiptService: ReceiptService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.params['orderId']);
    this.setupBreadcrumbButtons();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
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
        size: 'small',
        callback: () => this.goBack(),
      },
    });
  }

  getImageUrl(fileId: number | null | undefined): string | null {
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  }

  private loadData(): void {
    this.ordersService.ordersGetOrderGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.orderDetail.set(res.result ?? null),
      });

    this.loadBills();

    this.ordersService.ordersGetServiceChargeOptionsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.scOptions.set(res.result ?? []),
      });
  }

  private loadBills(): void {
    this.ordersService.ordersGetBillsGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const bills = res.result ?? [];
          this.allBills.set(bills);
          this.autoSelectPendingBill(bills);
          this.syncScDropdown();
        },
      });
  }

  private autoSelectPendingBill(bills: OrderBillResponseModel[]): void {
    const pendingIdx = bills.findIndex(b => b.status === 'Pending');
    this.selectedBillIndex.set(pendingIdx >= 0 ? pendingIdx : 0);
    this.numpadDisplay.set('0');
  }

  private syncScDropdown(): void {
    const bill = this.currentBill();
    const options = this.scOptions();
    if (bill && bill.serviceChargeRate && options.length) {
      const matched = options.find(sc => sc.percentageRate === bill.serviceChargeRate);
      this.selectedScId.set(matched?.serviceChargeId ?? null);
    } else {
      this.selectedScId.set(null);
    }
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

    this.ordersService.ordersUpdateBillChargesPut({
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
    this.paymentsService.paymentsPayCashPost({
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
          const messages: string[] = [];
          if (change > 0) {
            messages.push(`เงินทอน ${change.toFixed(2)} บาท`);
          }
          messages.push('ต้องการดาวน์โหลดใบเสร็จหรือไม่?');

          const dialogRef = this.modalService.info({
            title: 'ชำระเงินสำเร็จ',
            message: messages,
            confirmButtonLabel: 'ดาวน์โหลดใบเสร็จ',
            cancelButtonLabel: 'ข้าม',
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

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { mode: string; numberOfSplits?: number; groups?: { orderItemIds: number[] }[] } | undefined) => {
        if (!result) return;
        if (result.mode === 'by-amount') {
          this.ordersService
            .ordersSplitByAmountPost({
              orderId: this.orderId,
              body: { numberOfSplits: result.numberOfSplits! },
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => this.loadBills() });
        } else {
          this.ordersService
            .ordersSplitByItemPost({
              orderId: this.orderId,
              body: { groups: result.groups! },
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({ next: () => this.loadBills() });
        }
      });
  }

  private afterPayment(): void {
    this.loadBills();
  }

  goBack(): void {
    this.router.navigate(['/payment']);
  }
}
