import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { VerifyPinDialogComponent } from '@app/shared/dialogs/verify-pin/verify-pin-dialog.component';
import { OrderBillResponseModel } from '@app/core/api/models/order-bill-response-model';
import { SlipUploadResultModel } from '@app/core/api/models/slip-upload-result-model';
import { OrdersService } from '@app/core/api/services/orders.service';
import { PaymentsService } from '@app/core/api/services/payments.service';
import { ShopSettingsService } from '@app/core/api/services/shop-settings.service';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-qr-payment-dialog',
  standalone: false,
  templateUrl: './qr-payment-dialog.component.html',
})
export class QrPaymentDialogComponent implements OnInit {
  selectedBill = signal<OrderBillResponseModel | null>(null);
  isUploading = signal(false);
  isSaving = signal(false);

  // Shop payment info
  shopQrUrl = signal<string | null>(null);
  bankName = signal<string | null>(null);
  accountNumber = signal<string | null>(null);
  accountName = signal<string | null>(null);
  taxId = signal<string | null>(null);
  companyNameThai = signal<string | null>(null);
  companyNameEnglish = signal<string | null>(null);
  shopLogoUrl = signal<string | null>(null);

  // Customer slip from bill (Scenario A)
  customerSlipUrl = signal<string | null>(null);

  // Staff-uploaded slip (Scenario B)
  slipFile = signal<File | null>(null);
  slipPreviewUrl = signal<string | null>(null);
  slipResult = signal<SlipUploadResultModel | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private apiConfig: ApiConfiguration,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
    private shopSettingsService: ShopSettingsService,
    private modalService: ModalService,
    private dialogService: DialogService,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group({
      note: [null],
      manualAmount: [null],
    });
  }

  ngOnInit(): void {
    this.loadShopPaymentInfo();
    this.loadBill();
  }

  private loadShopPaymentInfo(): void {
    this.shopSettingsService
      .shopSettingsGetGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.result;
          if (!data) return;
          if (data.paymentQrCodeFileId) {
            this.shopQrUrl.set(
              `${this.apiConfig.rootUrl}/api/admin/file/${data.paymentQrCodeFileId}`
            );
          }
          this.bankName.set(data.bankName ?? null);
          this.accountNumber.set(data.accountNumber ?? null);
          this.accountName.set(data.accountName ?? null);
          this.taxId.set(data.taxId ?? null);
          this.companyNameThai.set(data.companyNameThai ?? null);
          this.companyNameEnglish.set(data.companyNameEnglish ?? null);
          if (data.logoFileId) {
            this.shopLogoUrl.set(
              `${this.apiConfig.rootUrl}/api/admin/file/${data.logoFileId}`
            );
          }
        },
      });
  }

  private loadBill(): void {
    const orderId = this.config.data.orderId;
    const orderBillId = this.config.data.orderBillId;
    this.ordersService
      .ordersGetBillsGet({ orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const bill = (res.result ?? []).find(
            (b) => b.orderBillId === orderBillId
          );
          if (!bill) return;

          this.selectedBill.set(bill);

          // Set customer slip URL if exists (Scenario A)
          if (bill.customerSlipFileId) {
            this.customerSlipUrl.set(
              `${this.apiConfig.rootUrl}/api/admin/file/${bill.customerSlipFileId}`
            );
          }
        },
      });
  }

  // --- Scenario B: Staff upload ---

  onSelectSlip(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.slipFile.set(file);
    this.slipResult.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      this.slipPreviewUrl.set(reader.result as string);
      // Auto OCR after preview is set
      this.onVerifyWithOcr();
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  onVerifyWithOcr(): void {
    const file = this.slipFile();
    const bill = this.selectedBill();
    if (!file || !bill) return;

    this.isUploading.set(true);
    this.paymentsService
      .paymentsUploadSlipPost({
        body: {
          OrderBillId: bill.orderBillId!,
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
        },
      });
  }

  onConfirmWithOcr(): void {
    const result = this.slipResult();
    if (!result) return;

    this.isSaving.set(true);
    this.confirmPayment(result.slipImageFileId, result.ocrAmount);
  }

  // --- Scenario A: Customer slip ---

  onConfirmCustomerSlip(): void {
    const bill = this.selectedBill();
    if (!bill) return;

    this.isSaving.set(true);
    // Backend will use bill.CustomerSlipFileId when request has no slip
    this.confirmPayment(undefined, undefined);
  }

  // --- Scenario C: No slip (requires PIN verification) ---

  onConfirmNoSlip(): void {
    const bill = this.selectedBill();
    if (!bill) return;

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
          this.isSaving.set(true);
          this.confirmPayment(undefined, undefined);
        }
      });
  }

  private confirmPayment(
    slipImageFileId?: number | null,
    ocrAmount?: number | null
  ): void {
    const bill = this.selectedBill();
    if (!bill) return;

    this.paymentsService
      .paymentsConfirmQrPaymentPost({
        body: {
          orderBillId: bill.orderBillId!,
          slipImageFileId: slipImageFileId,
          ocrAmount: ocrAmount,
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

  resetSlip(): void {
    this.slipFile.set(null);
    this.slipPreviewUrl.set(null);
    this.slipResult.set(null);
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
