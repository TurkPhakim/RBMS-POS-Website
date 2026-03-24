import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';

import { PaymentResponseModel } from '@app/core/api/models/payment-response-model';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ReceiptService } from '@app/core/services/receipt.service';

const KEY_BTN_BACK = 'back-payment-history';

@Component({
  selector: 'app-payment-history',
  standalone: false,
  templateUrl: './payment-history.component.html',
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  payments = signal<PaymentResponseModel[]>([]);
  totalRecords = signal(0);
  downloadingId = signal<number | null>(null);

  constructor(
    private paymentsService: PaymentsService,
    private breadcrumbService: BreadcrumbService,
    private receiptService: ReceiptService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumbButtons();
    this.loadHistory();
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
        callback: () => this.router.navigate(['/payment']),
      },
    });
  }

  loadHistory(event?: TableLazyLoadEvent): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? 10;
    const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;

    this.paymentsService.paymentsGetHistoryGet({
      Page: page,
      ItemPerPage: rows,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.payments.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
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
}
