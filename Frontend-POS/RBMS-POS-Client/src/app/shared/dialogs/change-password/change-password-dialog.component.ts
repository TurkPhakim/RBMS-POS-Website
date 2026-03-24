import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AuthService as AuthApiService } from '@app/core/api/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { PasswordStrength } from '@app/shared/component-interfaces';
import { markFormDirty } from '@app/shared/utils';
const MAX_ATTEMPTS = 3;

@Component({
  selector: 'app-change-password-dialog',
  standalone: false,
  templateUrl: './change-password-dialog.component.html',
})
export class ChangePasswordDialogComponent {
  form: FormGroup;
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  strength = signal<PasswordStrength>('weak');
  attempts = signal(0);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly modalService: ModalService,
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
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

  onSubmit(): void {
    markFormDirty(this.form);

    if (this.form.invalid || this.isLoading()) return;

    const { currentPassword, newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.modalService.cancel({
        title: 'ผิดพลาด !',
        message: 'รหัสผ่านใหม่ไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง',
      });
      return;
    }

    this.isLoading.set(true);

    this.authApiService
      .authChangePasswordPost({
        body: { currentPassword, newPassword, confirmPassword },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.ref.close(true);
          this.modalService.commonSuccess();
        },
        error: (err) => {
          this.isLoading.set(false);
          const newAttempts = this.attempts() + 1;
          this.attempts.set(newAttempts);

          if (newAttempts >= MAX_ATTEMPTS) {
            this.modalService.cancel({
              title: 'ผิดพลาด !',
              message: 'กรอกรหัสผ่านเก่าผิด กรุณาลองใหม่ภายหลัง',
            });
            this.ref.close(false);
            return;
          }

          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message:
              err.error?.message ||
              'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private evaluatePassword(password: string): void {
    let passedCount = 0;
    if (password.length >= 8 && password.length <= 128) passedCount++;
    if (/[A-Z]/.test(password)) passedCount++;
    if (/[a-z]/.test(password)) passedCount++;
    if (/\d/.test(password)) passedCount++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?/`~"\\]/.test(password)) passedCount++;

    if (passedCount <= 2) this.strength.set('weak');
    else if (passedCount <= 4) this.strength.set('medium');
    else this.strength.set('strong');
  }
}
