import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RecaptchaComponent } from 'ng-recaptcha';
import { DialogService } from 'primeng/dynamicdialog';

import { LoginRequestModel, LoginResponseModelBaseResponseModel } from '@app/core/api/models';
import { AuthService } from '@app/core/api/services';
import { AuthService as AppAuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { environment } from '@env/environment';
import { ForgotPasswordDialogComponent } from '../../dialogs/forgot-password-dialog/forgot-password-dialog.component';
import { VerifyOtpDialogComponent } from '../../dialogs/verify-otp-dialog/verify-otp-dialog.component';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  providers: [DialogService],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  loginForm!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  showCaptcha = signal(false);
  captchaToken = signal<string | null>(null);
  lockoutUntil = signal<Date | null>(null);
  lockoutRemaining = signal('00:00');
  returnUrl = '/';

  readonly recaptchaSiteKey = environment.recaptchaSiteKey;

  private lockoutInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly appAuthService: AppAuthService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: ModalService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: [''],
      password: [''],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ username, password }) => {
        const hasValues = !!(username?.trim() && password?.trim());
        if (!hasValues) this.captchaToken.set(null);
        this.showCaptcha.set(hasValues);
      });
  }

  ngOnDestroy(): void {
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onCaptchaResolved(token: string | null): void {
    this.captchaToken.set(token);
  }

  onSubmit(): void {
    if (!this.captchaToken()) return;

    this.loading.set(true);
    const { username, password } = this.loginForm.value;

    const loginRequest: LoginRequestModel = {
      username,
      password,
      rememberMe: false,
      captchaToken: this.captchaToken()!,
    };

    this.authService.authLoginPost({ body: loginRequest })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          this.loading.set(false);
          this.captchaRef?.reset();
          this.captchaToken.set(null);

          if (err.status === 423) {
            const lockedUntilStr = err.error?.result?.lockedUntil;
            this.modalService.cancel({
              title: 'บัญชีถูกล็อคชั่วคราว !',
              message: err.error?.message || 'บัญชีถูกล็อค กรุณาลองใหม่ภายหลัง',
            });
            if (lockedUntilStr) {
              this.startLockoutCountdown(lockedUntilStr);
            }
            return throwError(() => err);
          }

          let errorMsg: string;
          if (err.status === 0) {
            errorMsg = 'ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบการเชื่อมต่อ';
          } else if (err.status === 401) {
            errorMsg = err.error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
          } else if (err.status === 403) {
            errorMsg = err.error?.message || 'บัญชีถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
          } else if (err.status >= 500) {
            errorMsg = 'เกิดข้อผิดพลาดที่ Server กรุณาลองใหม่อีกครั้ง';
          } else {
            errorMsg = err.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          }

          this.modalService.cancel({ title: 'ผิดพลาด !', message: errorMsg });
          return throwError(() => err);
        }),
      )
      .subscribe({
        next: (response: LoginResponseModelBaseResponseModel) => {
          this.loading.set(false);

          if (response.result) {
            localStorage.setItem('access_token', response.result.accessToken || '');
            localStorage.setItem('refresh_token', response.result.refreshToken || '');
            localStorage.setItem('current_user', JSON.stringify(response.result.user));

            this.appAuthService.updateAuthState();
            this.modalService.commonSuccess();
            this.router.navigate([this.returnUrl]);
          }
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onForgotPassword(): void {
    const forgotRef = this.dialogService.open(ForgotPasswordDialogComponent, {
      showHeader: false,
      styleClass: 'card-dialog',
      width: '45vw',
      modal: true,
    });

    forgotRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { usernameOrEmail: string; maskedEmail: string; otpExpiresInSeconds: number } | undefined) => {
        if (!result) return;
        this.openVerifyOtpDialog(result.usernameOrEmail, result.maskedEmail, result.otpExpiresInSeconds);
      });
  }

  private openVerifyOtpDialog(usernameOrEmail: string, maskedEmail: string, otpExpiresInSeconds: number): void {
    const otpRef = this.dialogService.open(VerifyOtpDialogComponent, {
      showHeader: false,
      styleClass: 'card-dialog',
      width: '45vw',
      modal: true,
      data: { usernameOrEmail, maskedEmail, otpExpiresInSeconds },
    });

    otpRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { resetToken: string } | undefined) => {
        if (!result) return;
        this.router.navigate(['/auth/reset-password'], {
          queryParams: { token: result.resetToken },
        });
      });
  }

  private startLockoutCountdown(lockedUntilStr: string): void {
    const until = new Date(lockedUntilStr);
    this.lockoutUntil.set(until);

    const tick = () => {
      const remaining = Math.max(0, Math.floor((until.getTime() - Date.now()) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      this.lockoutRemaining.set(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );

      if (remaining <= 0) {
        if (this.lockoutInterval) {
          clearInterval(this.lockoutInterval);
          this.lockoutInterval = null;
        }
        this.lockoutUntil.set(null);
      }
    };

    tick();
    this.lockoutInterval = setInterval(tick, 1000);
  }
}
