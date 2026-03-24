import { Component, DestroyRef, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { DialogService } from 'primeng/dynamicdialog';

import { AuthService as AuthApiService } from '@app/core/api/services/auth.service';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { PinKeypadComponent } from '@app/shared/components/pin-keypad/pin-keypad.component';
import { VerifyPasswordDialogComponent } from '@app/shared/dialogs/verify-password/verify-password.component';

const MAX_ATTEMPTS = 3;

@Component({
  selector: 'app-verify-pin-dialog',
  standalone: false,
  templateUrl: './verify-pin-dialog.component.html',
  providers: [DialogService],
})
export class VerifyPinDialogComponent {
  @ViewChild('pinKeypad') pinKeypad!: PinKeypadComponent;

  errorMessage = signal('');
  isLoading = signal(false);
  attempts = signal(0);
  username: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly authApiService: AuthApiService,
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly modalService: ModalService,
  ) {
    this.username = this.authService.currentUserValue?.username ?? '';
  }

  onPinComplete(pin: string): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authApiService
      .authVerifyPinPost({ body: { pinCode: pin } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.ref.close(true);
        },
        error: () => {
          this.isLoading.set(false);
          const newAttempts = this.attempts() + 1;
          this.attempts.set(newAttempts);

          if (newAttempts >= MAX_ATTEMPTS) {
            this.modalService.cancel({
              title: 'ยืนยันตัวตนล้มเหลว',
              message: 'กรอกรหัส PIN ผิดเกินจำนวนครั้งที่กำหนด',
              onConfirm: () => this.ref.close('max-attempts'),
            });
            return;
          }

          this.errorMessage.set('รหัส PIN ไม่ถูกต้อง');
          this.pinKeypad?.reset();
        },
      });
  }

  onForgotPin(): void {
    const passRef = this.dialogService.open(VerifyPasswordDialogComponent, {
      header: 'ยืนยันด้วยรหัสผ่าน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
    });

    passRef.onClose.subscribe((result: boolean | string | undefined) => {
      if (result === true) {
        this.ref.close(true);
      } else if (result === 'max-attempts') {
        this.ref.close('max-attempts');
      }
    });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
