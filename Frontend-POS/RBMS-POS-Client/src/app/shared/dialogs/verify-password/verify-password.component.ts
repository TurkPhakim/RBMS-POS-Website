import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AuthService as AuthApiService } from '@app/core/api/services/auth.service';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';

const MAX_ATTEMPTS = 3;

@Component({
  selector: 'app-verify-password-dialog',
  standalone: false,
  templateUrl: './verify-password.component.html',
})
export class VerifyPasswordDialogComponent {
  passwordForm: FormGroup;
  showPassword = signal(false);
  isLoading = signal(false);
  attempts = signal(0);
  username: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
    private readonly authApiService: AuthApiService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
  ) {
    this.username = this.authService.currentUserValue?.username ?? '';
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);

    this.authApiService
      .authVerifyPasswordPost({
        body: { password: this.passwordForm.value.password },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          if (this.config.data?.returnPassword) {
            this.ref.close({ verified: true, password: this.passwordForm.value.password });
          } else {
            this.ref.close(true);
          }
        },
        error: () => {
          this.isLoading.set(false);
          const newAttempts = this.attempts() + 1;
          this.attempts.set(newAttempts);

          if (newAttempts >= MAX_ATTEMPTS) {
            this.modalService.cancel({
              title: 'ยืนยันตัวตนล้มเหลว',
              message: 'กรอกรหัสผ่านผิดเกินจำนวนครั้งที่กำหนด',
              onConfirm: () => this.ref.close('max-attempts'),
            });
            return;
          }

          this.passwordForm.get('password')!.setErrors({ incorrect: true });
          this.passwordForm.get('password')!.markAsDirty();
        },
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
