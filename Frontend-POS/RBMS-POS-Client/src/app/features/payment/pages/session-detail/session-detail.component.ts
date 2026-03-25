import { Component, computed, DestroyRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TieredMenu } from 'primeng/tieredmenu';

import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { PaymentResponseModel } from '@app/core/api/models/payment-response-model';
import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ReceiptService } from '@app/core/services/receipt.service';

const KEY_BTN_BACK = 'back-session-history';

@Component({
  selector: 'app-session-detail',
  standalone: false,
  templateUrl: './session-detail.component.html',
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  @ViewChild('actionMenu') actionMenu!: TieredMenu;

  session = signal<CashierSessionResponseModel | null>(null);
  downloadingId = signal<number | null>(null);
  currentMenuItems: MenuItem[] = [];

  groupedOrders = computed(() => {
    const payments = this.session()?.payments ?? [];
    const groups = new Map<string, OrderGroup>();

    payments.forEach(p => {
      const key = p.orderNumber ?? '';
      if (!groups.has(key)) {
        groups.set(key, {
          orderNumber: key,
          orderId: p.orderId!,
          payments: [],
          totalAmount: 0,
          paymentMethods: [],
          zoneName: p.zoneName ?? null,
          tableName: p.tableName ?? null,
          guestType: p.guestType ?? null,
          guestCount: p.guestCount ?? 0,
          latestPaidAt: p.paidAt,
        });
      }
      const group = groups.get(key)!;
      group.payments.push(p);
      group.totalAmount += (p.grandTotal ?? 0);
      if (p.paidAt && (!group.latestPaidAt || p.paidAt > group.latestPaidAt)) {
        group.latestPaidAt = p.paidAt;
      }
    });

    groups.forEach(g => {
      g.paymentMethods = [...new Set(g.payments.map(p => p.paymentMethod ?? ''))];
    });

    return [...groups.values()];
  });

  calculatedExpectedCash = computed(() => {
    const s = this.session();
    if (!s) return 0;
    const txs = s.cashDrawerTransactions ?? [];
    const cashIn = txs
      .filter(t => t.transactionType === 'CashIn')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const cashOut = txs
      .filter(t => t.transactionType === 'CashOut')
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);
    return (s.openingCash ?? 0) + (s.totalCashSales ?? 0) + cashIn - cashOut;
  });

  constructor(
    private cashierSessionsService: CashierSessionsService,
    private receiptService: ReceiptService,
    private breadcrumbService: BreadcrumbService,
    private apiConfig: ApiConfiguration,
    private route: ActivatedRoute,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('cashierSessionId'));
    if (!id) {
      this.router.navigate(['/payment', 'session-history']);
      return;
    }

    this.setupBreadcrumbButtons();
    this.loadSession(id);
  }

  loadSession(id: number): void {
    this.cashierSessionsService.cashierSessionsGetSessionByIdGet({ cashierSessionId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.session.set(res.result ?? null),
      });
  }

  onOpenMenu(event: Event, group: OrderGroup): void {
    this.currentMenuItems = [
      {
        label: 'ใบเสร็จรวมทุกบิล',
        icon: 'pi pi-file',
        command: () => this.onDownloadConsolidatedReceipt(group.orderId),
      },
      { separator: true },
      ...group.payments.map(p => ({
        label: p.billNumber ?? 'ใบเสร็จ',
        icon: 'pi pi-download',
        command: () => this.onDownloadReceipt(p.paymentId!),
      })),
    ];
    this.actionMenu.toggle(event);
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

  onDownloadConsolidatedReceipt(orderId: number): void {
    this.receiptService.downloadConsolidatedReceipt(orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
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
        callback: () => this.router.navigate(['/payment', 'session-history']),
      },
    });
  }
}

interface OrderGroup {
  orderNumber: string;
  orderId: number;
  payments: PaymentResponseModel[];
  totalAmount: number;
  paymentMethods: string[];
  zoneName: string | null;
  tableName: string | null;
  guestType: string | null;
  guestCount: number;
  latestPaidAt: string | undefined;
}
