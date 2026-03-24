import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '@app/core/api/services';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-verify-otp-dialog',
  standalone: false,
  templateUrl: './verify-otp-dialog.component.html',
})
export class VerifyOtpDialogComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  form: FormGroup;
  isLoading = signal(false);
  isResending = signal(false);

  maskedEmail: string;
  usernameOrEmail: string;

  countdown = signal(0);
  countdownDisplay = signal('00:00');
  canResend = signal(false);

  otpIndexes = [0, 1, 2, 3, 4, 5];

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
  ) {
    this.usernameOrEmail = this.config.data.usernameOrEmail;
    this.maskedEmail = this.config.data.maskedEmail;

    this.form = this.formBuilder.group({
      otpCode: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit(): void {
    this.startCountdown(this.config.data.otpExpiresInSeconds ?? 180);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    input.value = value.slice(0, 1);
    this.syncOtpCode();

    if (value && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = this.otpInputs.toArray()[index - 1].nativeElement;
      prev.value = '';
      prev.focus();
      this.syncOtpCode();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted =
      event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ??
      '';
    const inputs = this.otpInputs.toArray();
    for (let i = 0; i < 6; i++) {
      inputs[i].nativeElement.value = pasted[i] || '';
    }
    this.syncOtpCode();
    const focusIndex = Math.min(pasted.length, 5);
    inputs[focusIndex].nativeElement.focus();
  }

  onSubmit(): void {
    this.syncOtpCode();
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.authService
      .authVerifyOtpPost({
        body: {
          usernameOrEmail: this.usernameOrEmail,
          otpCode: this.form.value.otpCode,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.ref.close({
            resetToken: response.result?.resetToken ?? '',
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: err.error?.message || 'รหัส OTP ไม่ถูกต้อง',
          });
        },
      });
  }

  onResendOtp(): void {
    this.isResending.set(true);

    this.authService
      .authForgotPasswordPost({
        body: { usernameOrEmail: this.usernameOrEmail },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isResending.set(false);
          this.clearOtpInputs();
          this.startCountdown(response.result?.otpExpiresInSeconds ?? 180);
          this.modalService.info({
            title: 'ส่ง OTP สำเร็จ',
            message: `ส่งรหัส OTP ใหม่ไปยัง ${response.result?.maskedEmail ?? this.maskedEmail} แล้ว`,
          });
        },
        error: (err) => {
          this.isResending.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message:
              err.error?.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }

  private syncOtpCode(): void {
    const code = this.otpInputs
      .toArray()
      .map((i) => i.nativeElement.value)
      .join('');
    this.form.get('otpCode')!.setValue(code);
  }

  private clearOtpInputs(): void {
    this.otpInputs?.toArray().forEach((i) => (i.nativeElement.value = ''));
    this.form.get('otpCode')!.setValue('');
  }

  private startCountdown(seconds: number): void {
    this.clearCountdown();
    this.countdown.set(seconds);
    this.canResend.set(false);
    this.updateCountdownDisplay();

    this.countdownInterval = setInterval(() => {
      const remaining = this.countdown() - 1;
      this.countdown.set(remaining);
      this.updateCountdownDisplay();

      if (remaining <= 0) {
        this.clearCountdown();
        this.canResend.set(true);
      }
    }, 1000);
  }

  private updateCountdownDisplay(): void {
    const remaining = this.countdown();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    this.countdownDisplay.set(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    );
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}
