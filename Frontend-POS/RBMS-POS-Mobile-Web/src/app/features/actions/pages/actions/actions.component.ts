import { Component, DestroyRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ModalService, Icon } from '@core/services/modal.service';

const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-actions',
  standalone: false,
  templateUrl: './actions.component.html',
})
export class ActionsComponent {
  waiterCooldown = signal(0);
  billRequested = signal(false);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private selfOrderService: SelfOrderService,
    private modalService: ModalService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.restoreCooldown();
  }

  callWaiter(): void {
    this.selfOrderService.selfOrderCallWaiterPost()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.success({
            title: 'เรียกพนักงานแล้ว',
            message: 'พนักงานกำลังมาที่โต๊ะ',
          });
          this.startCooldown();
        },
        error: (err) => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: err?.error?.message || 'ไม่สามารถเรียกพนักงานได้',
          });
        },
      });
  }

  requestBill(): void {
    this.modalService.info({
      title: 'ยืนยันขอบิล',
      message: 'ต้องการเช็คบิลเพื่อชำระเงินใช่ไหม?',
      icon: Icon.Question,
      confirmButtonLabel: 'ขอบิล',
    }).onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.doRequestBill();
      });
  }

  private doRequestBill(): void {
    this.selfOrderService.selfOrderRequestBillPost()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.billRequested.set(true);
          this.modalService.success({
            title: 'ขอบิลสำเร็จ',
            message: 'กรุณารอพนักงานจัดเตรียมบิล',
          });
          this.router.navigate(['/bill/waiting'], { replaceUrl: true });
        },
        error: (err) => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: err?.error?.message || 'ไม่สามารถขอบิลได้',
          });
        },
      });
  }

  private startCooldown(): void {
    sessionStorage.setItem('call_waiter_at', Date.now().toString());
    this.runCooldown(COOLDOWN_SECONDS);
  }

  private restoreCooldown(): void {
    const savedAt = sessionStorage.getItem('call_waiter_at');
    if (!savedAt) return;
    const elapsed = Math.floor((Date.now() - parseInt(savedAt, 10)) / 1000);
    const remaining = COOLDOWN_SECONDS - elapsed;
    if (remaining > 0) {
      this.runCooldown(remaining);
    } else {
      sessionStorage.removeItem('call_waiter_at');
    }
  }

  private runCooldown(seconds: number): void {
    this.waiterCooldown.set(seconds);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const next = this.waiterCooldown() - 1;
      this.waiterCooldown.set(next);
      if (next <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
        sessionStorage.removeItem('call_waiter_at');
      }
    }, 1000);
  }
}
