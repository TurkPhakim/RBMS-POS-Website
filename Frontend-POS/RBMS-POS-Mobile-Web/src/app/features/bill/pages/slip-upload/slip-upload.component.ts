import { Component, computed, DestroyRef, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '@core/services/modal.service';
import { CustomerService } from '@core/api/services/customer.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { SlipUploadResultModel } from '@core/api/models/slip-upload-result-model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-slip-upload',
  standalone: false,
  templateUrl: './slip-upload.component.html',
})
export class SlipUploadComponent implements OnDestroy {
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);
  uploadResult = signal<SlipUploadResultModel | null>(null);
  copied = signal(false);

  session = signal<ReturnType<CustomerAuthService['getSession']>>(null);
  qrCodeUrl = computed(() => {
    const fileId = this.session()?.paymentQrCodeFileId;
    return fileId ? `${environment.apiUrl}/api/admin/file/${fileId}` : null;
  });

  private orderBillId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private customerAuth: CustomerAuthService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {
    this.orderBillId = Number(this.route.snapshot.queryParamMap.get('billId'));
    this.session.set(this.customerAuth.getSession());
  }

  ngOnDestroy(): void {
    // Release claim ถ้ายังไม่ได้ upload สลิป (navigate back)
    if (!this.uploadResult()) {
      const qrToken = this.customerAuth.getQrToken();
      if (qrToken && this.orderBillId) {
        this.customerService.customerReleaseBillPost({
          qrToken,
          orderBillId: this.orderBillId,
        }).subscribe();
      }
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearFile(fileInput?: HTMLInputElement): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    if (fileInput) fileInput.value = '';
  }

  async saveQrImage(): Promise<void> {
    const url = this.qrCodeUrl();
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr-payment.png';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* ignore */ }
  }

  async copyAccountNumber(): Promise<void> {
    const num = this.session()?.accountNumber;
    if (!num) return;
    try {
      await navigator.clipboard.writeText(num);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch { /* ignore */ }
  }

  goToCounter(): void {
    this.router.navigate(['/bill/complete'], {
      queryParams: { billId: this.orderBillId, method: 'Transfer' },
      replaceUrl: true,
    });
  }

  uploadSlip(): void {
    const file = this.selectedFile();
    const qrToken = this.customerAuth.getQrToken();
    if (!file || !qrToken || !this.orderBillId) return;

    this.isUploading.set(true);

    this.customerService.customerUploadSlipPost({
      qrToken,
      body: {
        OrderBillId: this.orderBillId,
        slipFile: file,
      },
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isUploading.set(false);
          this.uploadResult.set(res.result ?? null);
          const ref = this.modalService.success({
            title: 'อัปโหลดสำเร็จ',
            message: 'รอพนักงานตรวจสอบ',
          });
          ref.onClose.subscribe(() => {
            this.router.navigate(['/bill/complete'], {
              queryParams: { billId: this.orderBillId, method: 'Transfer' },
              replaceUrl: true,
            });
          });
        },
        error: (err) => {
          this.isUploading.set(false);
          this.modalService.cancel({
            title: 'อัปโหลดไม่สำเร็จ',
            message: err?.error?.message || 'กรุณาลองใหม่',
          });
        },
      });
  }
}
