import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { OrderBillResponseModel } from '@app/core/api/models/order-bill-response-model';
import { SlipUploadResultModel } from '@app/core/api/models/slip-upload-result-model';
import { OrdersService } from '@app/core/api/services/orders.service';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';
import { environment } from '@env/environment';

@Component({
  selector: 'app-qr-payment-dialog',
  standalone: false,
  templateUrl: './qr-payment-dialog.component.html',
})
export class QrPaymentDialogComponent implements OnInit {
  bills = signal<OrderBillResponseModel[]>([]);
  selectedBill = signal<OrderBillResponseModel | null>(null);
  isUploading = signal(false);
  isSaving = signal(false);

  // Slip upload state
  slipResult = signal<SlipUploadResultModel | null>(null);
  slipPreviewUrl = signal<string | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private modalService: ModalService,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group({
      paymentReference: [null],
      note: [null],
      manualAmount: [null, [Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.loadBills();
  }

  private loadBills(): void {
    const orderId = this.config.data.orderId;
    this.ordersService.ordersGetBillsGet({ orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const pendingBills = (res.result ?? []).filter(b => b.status === 'Pending');
          this.bills.set(pendingBills);
          if (pendingBills.length === 1) {
            this.selectBill(pendingBills[0]);
          }
        },
      });
  }

  selectBill(bill: OrderBillResponseModel): void {
    this.selectedBill.set(bill);
    this.slipResult.set(null);
    this.slipPreviewUrl.set(null);
  }

  onSlipSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const bill = this.selectedBill();
    if (!bill) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => this.slipPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    // Upload + OCR
    this.isUploading.set(true);
    this.paymentsService.paymentsUploadSlipPost({
      body: {
        OrderBillId: bill.orderBillId!,
        PaymentReference: this.form.get('paymentReference')?.value,
        slipFile: file,
      },
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.slipResult.set(res.result ?? null);
          this.isUploading.set(false);
        },
        error: () => {
          this.isUploading.set(false);
          this.slipPreviewUrl.set(null);
        },
      });

    // Reset input so same file can be re-selected
    input.value = '';
  }

  getSlipImageUrl(fileId: number): string {
    return `${environment.apiUrl}/api/admin/file/${fileId}`;
  }

  onConfirm(): void {
    const bill = this.selectedBill();
    const result = this.slipResult();
    if (!bill) return;

    // ถ้ายังไม่ upload slip → ถามว่าจะ manual confirm ไหม
    if (!result) {
      this.modalService.cancel({
        title: 'ยังไม่ได้อัพโหลดสลิป',
        message: 'กรุณาอัพโหลดสลิปก่อนยืนยันการชำระเงิน',
      });
      return;
    }

    this.isSaving.set(true);
    this.paymentsService.paymentsConfirmQrPaymentPost({
      body: {
        orderBillId: bill.orderBillId!,
        slipImageFileId: result.slipImageFileId,
        ocrAmount: result.ocrAmount,
        paymentReference: this.form.get('paymentReference')?.value,
        note: this.form.get('note')?.value,
        manualAmount: this.form.get('manualAmount')?.value,
      },
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => this.isSaving.set(false),
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
