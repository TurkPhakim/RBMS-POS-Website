import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { interval, Subject, switchMap, takeUntil } from 'rxjs';
import { CustomerService } from '@app/core/api/services';
import {
  CustomerBillResponseModel,
  CustomerBillSummaryModel,
  CustomerOrderItemModel,
  SlipUploadResultModel,
} from '@app/core/api/models';

@Component({
  selector: 'app-customer-bill',
  standalone: false,
  templateUrl: './customer-bill.component.html',
})
export class CustomerBillComponent implements OnInit, OnDestroy {
  qrToken = '';
  billData = signal<CustomerBillResponseModel | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  uploadingBillId = signal<number | null>(null);
  uploadResult = signal<SlipUploadResultModel | null>(null);
  uploadError = signal<string | null>(null);

  pollingBillId = signal<number | null>(null);
  paidBillIds = signal<Set<number>>(new Set());

  private stopPolling$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.qrToken = this.route.snapshot.params['qrToken'] ?? '';
    this.loadBill();
  }

  ngOnDestroy(): void {
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }

  loadBill(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.customerService
      .customerGetBillGet({ qrToken: this.qrToken })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.billData.set(res.result ?? null);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'ไม่สามารถโหลดข้อมูลบิลได้',
          );
          this.isLoading.set(false);
        },
      });
  }

  onSelectFile(event: Event, bill: CustomerBillSummaryModel): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !bill.orderBillId) return;

    this.uploadingBillId.set(bill.orderBillId);
    this.uploadResult.set(null);
    this.uploadError.set(null);

    this.customerService
      .customerUploadSlipPost({
        qrToken: this.qrToken,
        body: {
          OrderBillId: bill.orderBillId,
          slipFile: file,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.uploadingBillId.set(null);
          this.uploadResult.set(res.result ?? null);
          this.startPolling(bill.orderBillId!);
        },
        error: (err) => {
          this.uploadingBillId.set(null);
          this.uploadError.set(
            err.error?.message || 'อัปโหลดสลิปไม่สำเร็จ',
          );
        },
      });

    input.value = '';
  }

  getVerificationLabel(status: string | null | undefined): string {
    switch (status) {
      case 'AutoMatched':
        return 'ยอดตรงกัน — รอพนักงานยืนยัน';
      case 'ManualReview':
        return 'OCR อ่านไม่ได้ — รอพนักงานตรวจสอบ';
      case 'Mismatch':
        return 'ยอดไม่ตรง — รอพนักงานตรวจสอบ';
      default:
        return 'กำลังตรวจสอบ...';
    }
  }

  getBillStatusLabel(bill: CustomerBillSummaryModel): string {
    if (this.paidBillIds().has(bill.orderBillId!)) return 'ชำระแล้ว';
    switch (bill.status) {
      case 'Pending':
        return 'รอชำระ';
      case 'Paid':
        return 'ชำระแล้ว';
      case 'Cancelled':
        return 'ยกเลิก';
      default:
        return bill.status ?? '';
    }
  }

  isBillPending(bill: CustomerBillSummaryModel): boolean {
    return (
      bill.status === 'Pending' && !this.paidBillIds().has(bill.orderBillId!)
    );
  }

  isBillPaid(bill: CustomerBillSummaryModel): boolean {
    return (
      bill.status === 'Paid' || this.paidBillIds().has(bill.orderBillId!)
    );
  }

  formatCurrency(value: number | undefined): string {
    return (value ?? 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private startPolling(orderBillId: number): void {
    this.pollingBillId.set(orderBillId);
    this.stopPolling$.next();

    interval(5000)
      .pipe(
        takeUntil(this.stopPolling$),
        takeUntilDestroyed(this.destroyRef),
        switchMap(() =>
          this.customerService.customerGetPaymentStatusGet({
            qrToken: this.qrToken,
            orderBillId,
          }),
        ),
      )
      .subscribe({
        next: (res) => {
          if (res.result === 'Paid') {
            this.stopPolling$.next();
            this.pollingBillId.set(null);
            const updated = new Set(this.paidBillIds());
            updated.add(orderBillId);
            this.paidBillIds.set(updated);
            this.uploadResult.set(null);
          }
        },
      });
  }
}
