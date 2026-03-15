import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/api/services';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

type PasswordStrength = 'weak' | 'medium' | 'strong';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  strength = signal<PasswordStrength>('weak');

  private resetToken = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParams['token'] || '';

    if (!this.resetToken) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.form = this.formBuilder.group({
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });

    this.form
      .get('newPassword')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => this.evaluatePassword(value || ''));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    markFormDirty(this.form);

    const { newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.modalService.cancel({
        title: 'ผิดพลาด !',
        message: 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง',
      });
      return;
    }

    if (this.form.invalid) return;

    this.loading.set(true);

    this.authService
      .authResetPasswordPost({
        body: {
          resetToken: this.resetToken,
          newPassword,
          confirmPassword,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.modalService.success({
            title: 'การเปลี่ยนรหัสผ่านสำเร็จ !',
            message: 'โปรดเข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่',
            onConfirm: () => this.router.navigate(['/auth/login']),
          });
        },
        error: (err) => {
          this.loading.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message:
              err.error?.message ||
              'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
  }

  private evaluatePassword(password: string): void {
    let passedCount = 0;
    if (password.length >= 8 && password.length <= 128) passedCount++;
    if (/[A-Z]/.test(password)) passedCount++;
    if (/[a-z]/.test(password)) passedCount++;
    if (/\d/.test(password)) passedCount++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/`~"\\]/.test(password)) passedCount++;

    if (passedCount <= 2) {
      this.strength.set('weak');
    } else if (passedCount <= 4) {
      this.strength.set('medium');
    } else {
      this.strength.set('strong');
    }
  }
}
