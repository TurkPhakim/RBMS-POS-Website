import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '@app/core/api/services';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: false,
  templateUrl: './forgot-password-dialog.component.html',
})
export class ForgotPasswordDialogComponent {
  form: FormGroup;
  isLoading = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly destroyRef: DestroyRef,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
  ) {
    this.form = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
    });
  }

  onSubmit(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.authService
      .authForgotPasswordPost({ body: this.form.value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.ref.close({
            usernameOrEmail: this.form.value.usernameOrEmail,
            maskedEmail: response.result?.maskedEmail ?? '',
            otpExpiresInSeconds: response.result?.otpExpiresInSeconds ?? 180,
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.modalService.cancel({
            title: 'ผิดพลาด !',
            message: err.error?.message || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }
}
