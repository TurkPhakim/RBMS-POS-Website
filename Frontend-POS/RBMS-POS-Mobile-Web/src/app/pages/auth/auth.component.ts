import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  isLoading = signal(true);
  errorMessage = signal('');
  errorLottieOptions: AnimationOptions = {
    path: 'animations/access-denied.json',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private selfOrderService: SelfOrderService,
    private customerAuth: CustomerAuthService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.isLoading.set(false);
      this.errorMessage.set('ลิงก์ไม่ถูกต้อง');
      return;
    }

    this.selfOrderService.selfOrderAuthenticatePost({
      body: {
        qrToken: token,
        deviceFingerprint: this.getDeviceFingerprint()
      }
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        const r = res.result!;
        this.customerAuth.saveSession({
          token: r.sessionToken!,
          tableId: r.tableId!,
          tableName: r.tableName!,
          zoneName: r.zoneName!,
          nickname: r.nickname,
          shopNameThai: r.shopNameThai,
          shopNameEnglish: r.shopNameEnglish,
          logoFileId: r.logoFileId,
          address: r.address,
          phoneNumber: r.phoneNumber,
          shopEmail: r.shopEmail,
          facebook: r.facebook,
          instagram: r.instagram,
          website: r.website,
          paymentQrCodeFileId: r.paymentQrCodeFileId,
          bankName: r.bankName,
          accountNumber: r.accountNumber,
          accountName: r.accountName,
          wifiSsid: r.wifiSsid,
          wifiPassword: r.wifiPassword,
          qrToken: token!,
        });
        // Redirect ตามสถานะ order
        if (r.orderStatus === 'Billing') {
          this.router.navigate([r.hasBills ? '/bill/summary' : '/bill/waiting'], { replaceUrl: true });
        } else {
          this.router.navigate(['/menu'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.error?.errors?.[0] || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
        this.errorMessage.set(msg);
      }
    });
  }

  private getDeviceFingerprint(): string {
    const STORAGE_KEY = 'device_fingerprint';
    let fp = localStorage.getItem(STORAGE_KEY);
    if (!fp) {
      fp = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, fp);
    }
    return fp;
  }
}
