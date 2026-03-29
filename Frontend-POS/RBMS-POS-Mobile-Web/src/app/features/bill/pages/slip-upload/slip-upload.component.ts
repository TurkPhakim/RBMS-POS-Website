import { Component, computed, DestroyRef, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiConfiguration } from '@core/api/api-configuration';
import { ModalService } from '@core/services/modal.service';
import { CustomerService } from '@core/api/services/customer.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { SlipUploadResultModel } from '@core/api/models/slip-upload-result-model';

@Component({
  selector: 'app-slip-upload',
  standalone: false,
  templateUrl: './slip-upload.component.html',
})
export class SlipUploadComponent {
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);
  uploadResult = signal<SlipUploadResultModel | null>(null);

  session = signal<ReturnType<CustomerAuthService['getSession']>>(null);
  qrCodeUrl = computed(() => {
    const fileId = this.session()?.paymentQrCodeFileId;
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  });

  private orderBillId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiConfig: ApiConfiguration,
    private customerService: CustomerService,
    private customerAuth: CustomerAuthService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {
    this.orderBillId = Number(this.route.snapshot.queryParamMap.get('billId'));
    this.session.set(this.customerAuth.getSession());
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

  clearFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  goToCounter(): void {
    this.router.navigate(['/bill/complete'], {
      queryParams: { billId: this.orderBillId },
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
              queryParams: { billId: this.orderBillId },
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
