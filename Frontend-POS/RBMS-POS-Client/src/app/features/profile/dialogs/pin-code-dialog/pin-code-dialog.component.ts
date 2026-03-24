import { Component, DestroyRef, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AuthService as AuthApiService } from '@app/core/api/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { PinKeypadComponent } from '@app/shared/components/pin-keypad/pin-keypad.component';
import { VerifyPasswordDialogComponent } from '@app/shared/dialogs/verify-password/verify-password.component';

type PinStep = 'enter-current' | 'enter-new' | 'confirm-new';

const MAX_ATTEMPTS = 3;

@Component({
  selector: 'app-pin-code-dialog',
  standalone: false,
  templateUrl: './pin-code-dialog.component.html',
  providers: [DialogService],
})
export class PinCodeDialogComponent {
  @ViewChild('pinKeypad') pinKeypad!: PinKeypadComponent;

  hasPinCode: boolean;
  currentStep = signal<PinStep>('enter-new');
  errorMessage = signal('');
  isLoading = signal(false);
  attempts = signal(0);

  private currentPin = '';
  private newPin = '';

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly destroyRef: DestroyRef,
    private readonly authApiService: AuthApiService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
  ) {
    this.hasPinCode = this.config.data?.hasPinCode ?? false;
    if (this.hasPinCode) {
      this.currentStep.set('enter-current');
    }
  }

  get stepTitle(): string {
    switch (this.currentStep()) {
      case 'enter-current':
        return 'กรุณาใส่รหัส PIN ปัจจุบัน';
      case 'enter-new':
        return this.hasPinCode ? 'กรุณาตั้งรหัส PIN ใหม่ 6 หลัก' : 'กรุณาตั้งรหัส PIN 6 หลัก';
      case 'confirm-new':
        return 'ยืนยันรหัส PIN อีกครั้ง';
    }
  }

  get currentStepNumber(): number {
    const steps: PinStep[] = this.hasPinCode
      ? ['enter-current', 'enter-new', 'confirm-new']
      : ['enter-new', 'confirm-new'];
    return steps.indexOf(this.currentStep()) + 1;
  }

  get totalSteps(): number {
    return this.hasPinCode ? 3 : 2;
  }

  get dialogTitle(): string {
    return this.hasPinCode ? 'เปลี่ยนรหัส PIN' : 'ตั้งค่ารหัส PIN';
  }

  get showForgotPin(): boolean {
    return this.hasPinCode && this.currentStep() === 'enter-current';
  }

  onPinComplete(pin: string): void {
    this.errorMessage.set('');

    switch (this.currentStep()) {
      case 'enter-current':
        this.verifyCurrentPin(pin);
        break;

      case 'enter-new':
        this.newPin = pin;
        this.goToStep('confirm-new');
        break;

      case 'confirm-new':
        if (pin !== this.newPin) {
          this.errorMessage.set('รหัส PIN ไม่ตรงกัน กรุณาลองใหม่');
          this.newPin = '';
          setTimeout(() => this.goToStep('enter-new'), 800);
          return;
        }
        this.submitPin();
        break;
    }
  }

  onForgotPin(): void {
    const dialogRef = this.dialogService.open(VerifyPasswordDialogComponent, {
      header: 'ยืนยันตัวตน',
      width: '35vw',
      showHeader: false,
      styleClass: 'card-dialog',
      modal: true,
      data: { returnPassword: true },
    });

    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.verified && result?.password) {
          this.resetPinViaPassword(result.password);
        }
      });
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private verifyCurrentPin(pin: string): void {
    this.isLoading.set(true);

    this.authApiService
      .authVerifyPinPost({ body: { pinCode: pin } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.currentPin = pin;
          this.goToStep('enter-new');
        },
        error: () => {
          this.isLoading.set(false);
          const newAttempts = this.attempts() + 1;
          this.attempts.set(newAttempts);

          if (newAttempts >= MAX_ATTEMPTS) {
            this.ref.close(false);
            return;
          }

          this.errorMessage.set('รหัส PIN ไม่ถูกต้อง');
          setTimeout(() => this.pinKeypad?.reset(), 0);
        },
      });
  }

  private resetPinViaPassword(password: string): void {
    this.isLoading.set(true);

    this.authApiService
      .authResetPinPost({ body: { password } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.hasPinCode = false;
          this.currentPin = '';
          this.newPin = '';
          this.attempts.set(0);
          this.goToStep('enter-new');
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('เกิดข้อผิดพลาด กรุณาลองใหม่');
        },
      });
  }

  private goToStep(step: PinStep): void {
    this.currentStep.set(step);
    this.errorMessage.set('');
    setTimeout(() => this.pinKeypad?.reset(), 0);
  }

  private submitPin(): void {
    this.isLoading.set(true);

    if (this.hasPinCode) {
      this.authApiService
        .authChangePinPost({
          body: { currentPinCode: this.currentPin, newPinCode: this.newPin },
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.modalService.commonSuccess();
            this.ref.close(true);
          },
          error: () => {
            this.isLoading.set(false);
            this.currentPin = '';
            this.newPin = '';
            this.errorMessage.set('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setTimeout(() => this.goToStep('enter-current'), 800);
          },
        });
    } else {
      this.authApiService
        .authSetupPinPost({
          body: { pinCode: this.newPin },
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.modalService.commonSuccess();
            this.ref.close(true);
          },
          error: () => {
            this.isLoading.set(false);
            this.newPin = '';
            this.errorMessage.set('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setTimeout(() => this.goToStep('enter-new'), 800);
          },
        });
    }
  }
}
