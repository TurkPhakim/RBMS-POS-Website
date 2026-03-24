import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnimationOptions } from 'ngx-lottie';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { CustomerAuthService } from '@core/services/customer-auth.service';

@Component({
  selector: 'app-auth',
  standalone: false,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-badge via-primary-light/60 to-warning-bg">
      <div class="w-full text-center px-8 -mt-28">
        @if (isLoading()) {
          <div class="mb-2 flex justify-center">
            <img src="images/RBMS_Logo.png" alt="Logo" class="w-28 h-28 object-contain">
          </div>
          <h1 class="text-4xl font-bold text-primary-dark">
            กำลังเข้าสู่ระบบ...
          </h1>
          <p class="text-lg text-surface-dark/80 mt-4">
            กรุณารอสักครู่
          </p>
        }
        @if (errorMessage()) {
          <div class="-mb-6 flex justify-center">
            <ng-lottie
              [options]="errorLottieOptions"
              width="360px"
              height="360px"
            ></ng-lottie>
          </div>
          <h1 class="text-4xl font-bold text-primary-dark">
            เข้าสู่ระบบไม่สำเร็จ
          </h1>
          <p class="text-lg text-surface-dark/80 mt-4">
            กรุณาแจ้งพนักงาน
          </p>
          <p class="text-lg text-surface-dark/80">
            หรือสแกน QR Code ใหม่อีกครั้ง
          </p>
        }
      </div>
    </div>
  `,
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
          qrToken: token!,
        });
        this.router.navigate(['/menu'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.error?.errors?.[0] || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
        this.errorMessage.set(msg);
      }
    });
  }

  private getDeviceFingerprint(): string {
    const nav = navigator;
    return btoa(`${nav.userAgent}|${nav.language}|${screen.width}x${screen.height}`).slice(0, 40);
  }
}
