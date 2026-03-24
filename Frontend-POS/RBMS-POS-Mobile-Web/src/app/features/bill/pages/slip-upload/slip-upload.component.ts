import { Component, computed, DestroyRef, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ApiConfiguration } from '@core/api/api-configuration';
import { CustomerService } from '@core/api/services/customer.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { SlipUploadResultModel } from '@core/api/models/slip-upload-result-model';

@Component({
  selector: 'app-slip-upload',
  standalone: false,
  template: `
    <div class="p-4 space-y-4">
      <!-- ช่องทางชำระเงิน -->
      @if (qrCodeUrl() || session()?.bankName) {
        <div class="bg-white rounded-2xl border border-surface-border overflow-hidden">
          <app-card-header icon="payment-bath" title="ช่องทางชำระเงิน" gradient="primary"></app-card-header>
          <div class="p-5 space-y-4">
            @if (qrCodeUrl()) {
              <div class="flex justify-center">
                <img [src]="qrCodeUrl()" alt="QR Code" class="w-48 h-48 object-contain rounded-lg border border-surface-border">
              </div>
            }
            @if (session()?.bankName) {
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-surface-sub">ธนาคาร</span>
                  <span class="font-semibold">{{ session()!.bankName }}</span>
                </div>
                @if (session()!.accountNumber) {
                  <div class="flex justify-between">
                    <span class="text-surface-sub">เลขที่บัญชี</span>
                    <span class="font-semibold">{{ session()!.accountNumber }}</span>
                  </div>
                }
                @if (session()!.accountName) {
                  <div class="flex justify-between">
                    <span class="text-surface-sub">ชื่อบัญชี</span>
                    <span class="font-semibold">{{ session()!.accountName }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- อัปโหลดสลิป -->
      <p class="text-lg font-semibold">อัปโหลดสลิป</p>
      <p class="text-sm text-surface-sub -mt-2">ถ่ายรูปหรือเลือกสลิปจากแกลเลอรี</p>

      <!-- Image Preview / Upload Area -->
      <div>
        @if (previewUrl()) {
          <div class="relative">
            <img [src]="previewUrl()" alt="Slip preview" class="w-full max-h-[400px] object-contain rounded-lg border border-surface-border">
            <button pButton icon="pi pi-times" severity="danger" [rounded]="true" [text]="true"
                    class="absolute top-2 right-2" (click)="clearFile()"></button>
          </div>
        } @else {
          <label class="flex flex-col items-center justify-center h-48 border-2 border-dashed border-surface-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <i class="pi pi-camera text-3xl text-surface-sub"></i>
            <p class="text-sm text-surface-sub mt-2">แตะเพื่อเลือกรูปสลิป</p>
            <input type="file" accept="image/*" class="hidden" (change)="onFileSelect($event)">
          </label>
        }
      </div>

      <!-- Payment Reference (optional) -->
      <div class="mt-4">
        <label class="text-sm font-medium block mb-1">เลขอ้างอิง (ถ้ามี)</label>
        <input pInputText class="w-full" placeholder="เช่น เลขอ้างอิงการโอน" [(ngModel)]="paymentRef">
      </div>

      <!-- Upload Button -->
      <button pButton label="ส่งสลิป" class="w-full mt-6"
              [disabled]="!selectedFile() || isUploading()"
              [loading]="isUploading()"
              (click)="uploadSlip()"></button>

      <!-- Result -->
      @if (uploadResult()) {
        <div class="mt-4 bg-success/10 rounded-lg p-4">
          <p class="text-sm font-medium text-success">อัปโหลดสำเร็จ</p>
          @if (uploadResult()!.ocrAmount) {
            <p class="text-sm mt-1">ยอดที่อ่านได้: ฿{{ uploadResult()!.ocrAmount }}</p>
          }
          <p class="text-sm mt-1">ยอดบิล: ฿{{ uploadResult()!.billGrandTotal }}</p>
          <p class="text-xs text-surface-sub mt-2">รอพนักงานตรวจสอบสลิป...</p>
        </div>
      }
    </div>
  `,
})
export class SlipUploadComponent {
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);
  uploadResult = signal<SlipUploadResultModel | null>(null);
  paymentRef = '';

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
    private messageService: MessageService,
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

  uploadSlip(): void {
    const file = this.selectedFile();
    const qrToken = this.customerAuth.getQrToken();
    if (!file || !qrToken || !this.orderBillId) return;

    this.isUploading.set(true);

    this.customerService.customerUploadSlipPost({
      qrToken,
      body: {
        OrderBillId: this.orderBillId,
        PaymentReference: this.paymentRef || undefined,
        slipFile: file,
      },
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isUploading.set(false);
          this.uploadResult.set(res.result ?? null);
          this.messageService.add({
            severity: 'success',
            summary: 'อัปโหลดสำเร็จ',
            detail: 'รอพนักงานตรวจสอบ',
            life: 3000,
          });
          // Navigate to payment-complete waiting page after a short delay
          setTimeout(() => {
            this.router.navigate(['/bill/complete'], {
              queryParams: { billId: this.orderBillId },
              replaceUrl: true,
            });
          }, 2000);
        },
        error: (err) => {
          this.isUploading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'อัปโหลดไม่สำเร็จ',
            detail: err?.error?.message || 'กรุณาลองใหม่',
            life: 5000,
          });
        },
      });
  }
}
