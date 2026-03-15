import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

const WARNING_COUNTDOWN_S = 5 * 60; // 5 นาที

@Component({
  selector: 'app-session-timeout',
  standalone: false,
  templateUrl: './session-timeout.component.html',
})
export class SessionTimeoutComponent implements OnInit, OnDestroy {
  countdown = signal(WARNING_COUNTDOWN_S);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  get minutes(): string {
    return Math.floor(this.countdown() / 60).toString().padStart(2, '0');
  }

  get seconds(): string {
    return (this.countdown() % 60).toString().padStart(2, '0');
  }

  get progressPercent(): number {
    return (this.countdown() / WARNING_COUNTDOWN_S) * 100;
  }

  onLogout(): void {
    this.ref.close('logout');
  }

  onExtend(): void {
    this.ref.close('extend');
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        this.clearCountdown();
        this.ref.close('logout');
        return;
      }
      this.countdown.set(current - 1);
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}
