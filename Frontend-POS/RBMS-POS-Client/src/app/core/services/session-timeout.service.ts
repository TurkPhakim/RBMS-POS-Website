import { Injectable, NgZone } from '@angular/core';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { SessionTimeoutComponent } from '@app/shared/dialogs/session-timeout/session-timeout.component';
import { VerifyPasswordDialogComponent } from '@app/shared/dialogs/verify-password/verify-password.component';

import { AuthService } from './auth.service';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 นาที
const ACTIVITY_THROTTLE_MS = 30_000;
const STORAGE_KEY_LAST_ACTIVITY = 'session_last_activity';
const STORAGE_KEY_SESSION_STATE = 'session_state';

type SessionState = 'active' | 'warning' | 'logged_out';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private idleTimerId: ReturnType<typeof setTimeout> | null = null;
  private warningDialogRef: DynamicDialogRef | null = null;
  private verifyDialogRef: DynamicDialogRef | null = null;
  private isRunning = false;
  private inWarningState = false;
  private lastResetTime = 0;

  private readonly boundOnActivity = this.onActivity.bind(this);
  private readonly boundOnStorageEvent = this.onStorageEvent.bind(this);

  constructor(
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly ngZone: NgZone,
  ) {}

  start(): void {
    if (this.isRunning || !this.authService.isAuthenticated) return;
    this.isRunning = true;
    this.inWarningState = false;

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.boundOnActivity, {
        passive: true,
      });
      document.addEventListener('keydown', this.boundOnActivity, {
        passive: true,
      });
      document.addEventListener('click', this.boundOnActivity, {
        passive: true,
      });
      document.addEventListener('scroll', this.boundOnActivity, {
        passive: true,
      });
    });

    window.addEventListener('storage', this.boundOnStorageEvent);

    this.resetTimer();
    this.setSessionState('active');
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.inWarningState = false;

    document.removeEventListener('mousemove', this.boundOnActivity);
    document.removeEventListener('keydown', this.boundOnActivity);
    document.removeEventListener('click', this.boundOnActivity);
    document.removeEventListener('scroll', this.boundOnActivity);
    window.removeEventListener('storage', this.boundOnStorageEvent);

    this.clearIdleTimer();
    this.closeDialogs();
    this.removeStorageKeys();
  }

  private resetTimer(): void {
    this.clearIdleTimer();
    this.lastResetTime = Date.now();
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(Date.now()));

    this.ngZone.runOutsideAngular(() => {
      this.idleTimerId = setTimeout(() => {
        this.ngZone.run(() => this.showWarningDialog());
      }, IDLE_TIMEOUT_MS);
    });
  }

  private onActivity(): void {
    if (this.inWarningState) return;

    const now = Date.now();
    const elapsed = now - this.lastResetTime;

    // ถ้าเลยเวลา idle (เช่นเครื่องหลับ/tab background) → แสดง dialog ทันที
    if (elapsed >= IDLE_TIMEOUT_MS) {
      this.ngZone.run(() => this.showWarningDialog());
      return;
    }

    if (elapsed < ACTIVITY_THROTTLE_MS) return;

    this.resetTimer();
  }

  private showWarningDialog(): void {
    if (this.inWarningState) return;
    this.inWarningState = true;
    this.clearIdleTimer();
    this.setSessionState('warning');

    this.warningDialogRef = this.dialogService.open(SessionTimeoutComponent, {
      showHeader: false,
      styleClass: 'card-dialog',
      width: '30vw',
      modal: true,
      closable: false,
      closeOnEscape: false,
    });

    this.warningDialogRef.onClose.subscribe((result: string | undefined) => {
      this.warningDialogRef = null;

      if (result === 'extend') {
        this.showVerifyDialog();
      } else {
        this.performLogout();
      }
    });
  }

  private showVerifyDialog(): void {
    this.verifyDialogRef = this.dialogService.open(
      VerifyPasswordDialogComponent,
      {
        header: 'ยืนยันตัวตน',
        showHeader: false,
        styleClass: 'card-dialog',
        width: '30vw',
        modal: true,
        closable: false,
        closeOnEscape: false,
      },
    );

    this.verifyDialogRef.onClose.subscribe(
      (result: boolean | string | undefined) => {
        this.verifyDialogRef = null;

        if (result === true) {
          this.inWarningState = false;
          this.resetTimer();
          this.setSessionState('active');
        } else {
          this.performLogout();
        }
      },
    );
  }

  private performLogout(): void {
    this.setSessionState('logged_out');
    this.stop();
    this.authService.logout().subscribe();
  }

  private onStorageEvent(e: StorageEvent): void {
    if (!this.isRunning) return;

    if (e.key === STORAGE_KEY_LAST_ACTIVITY && e.newValue) {
      // Tab อื่น active → reset timer ใน tab นี้ด้วย
      if (!this.inWarningState) {
        this.clearIdleTimer();
        this.lastResetTime = Number(e.newValue);

        const elapsed = Date.now() - this.lastResetTime;
        const remaining = IDLE_TIMEOUT_MS - elapsed;

        if (remaining > 0) {
          this.ngZone.runOutsideAngular(() => {
            this.idleTimerId = setTimeout(() => {
              this.ngZone.run(() => this.showWarningDialog());
            }, remaining);
          });
        }
      }
    }

    if (e.key === STORAGE_KEY_SESSION_STATE && e.newValue) {
      const state = e.newValue as SessionState;

      this.ngZone.run(() => {
        if (state === 'logged_out') {
          this.stop();
          this.authService.clearAndRedirectToLogin();
        } else if (state === 'active' && this.inWarningState) {
          // Tab อื่น verify สำเร็จ → ปิด dialog + reset
          this.inWarningState = false;
          this.closeDialogs();
          this.resetTimer();
        } else if (state === 'warning' && !this.inWarningState) {
          // Tab อื่นเข้า warning → tab นี้แสดง warning ด้วย
          this.showWarningDialog();
        }
      });
    }
  }

  private setSessionState(state: SessionState): void {
    localStorage.setItem(STORAGE_KEY_SESSION_STATE, state);
  }

  private clearIdleTimer(): void {
    if (this.idleTimerId) {
      clearTimeout(this.idleTimerId);
      this.idleTimerId = null;
    }
  }

  private closeDialogs(): void {
    if (this.warningDialogRef) {
      this.warningDialogRef.close();
      this.warningDialogRef = null;
    }
    if (this.verifyDialogRef) {
      this.verifyDialogRef.close();
      this.verifyDialogRef = null;
    }
  }

  private removeStorageKeys(): void {
    localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
    localStorage.removeItem(STORAGE_KEY_SESSION_STATE);
  }
}
