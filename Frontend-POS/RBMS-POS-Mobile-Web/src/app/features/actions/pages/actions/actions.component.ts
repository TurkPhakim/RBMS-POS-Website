import { Component, DestroyRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';

const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-actions',
  standalone: false,
  providers: [DialogService],
  template: `
    <div class="p-4 space-y-3">
      <!-- Call Waiter -->
      <button pButton class="w-full !justify-start gap-3 !p-4" severity="secondary" [outlined]="true"
              [disabled]="waiterCooldown() > 0" (click)="callWaiter()">
        <app-generic-icon name="raise-hand" svgClass="w-6 h-6"></app-generic-icon>
        <div class="text-left">
          <p class="font-medium text-sm">เรียกพนักงาน</p>
          @if (waiterCooldown() > 0) {
            <p class="text-xs text-surface-sub">กรุณารอ {{ waiterCooldown() }} วินาที</p>
          } @else {
            <p class="text-xs text-surface-sub">แจ้งพนักงานมาที่โต๊ะ</p>
          }
        </div>
      </button>

      <!-- Request Bill -->
      <button pButton class="w-full !justify-start gap-3 !p-4" severity="secondary" [outlined]="true"
              [disabled]="billRequested()" (click)="requestBill()">
        <app-generic-icon name="bill" svgClass="w-6 h-6"></app-generic-icon>
        <div class="text-left">
          <p class="font-medium text-sm">ขอบิล</p>
          @if (billRequested()) {
            <p class="text-xs text-surface-sub">ขอบิลแล้ว — รอพนักงานจัดเตรียม</p>
          } @else {
            <p class="text-xs text-surface-sub">ขอเช็คบิลเพื่อชำระเงิน</p>
          }
        </div>
      </button>
    </div>
  `,
})
export class ActionsComponent {
  waiterCooldown = signal(0);
  billRequested = signal(false);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private selfOrderService: SelfOrderService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {}

  callWaiter(): void {
    this.selfOrderService.selfOrderCallWaiterPost()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'เรียกพนักงานแล้ว',
            detail: 'พนักงานกำลังมาที่โต๊ะ',
            life: 3000,
          });
          this.startCooldown();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: err?.error?.message || 'ไม่สามารถเรียกพนักงานได้',
            life: 5000,
          });
        },
      });
  }

  requestBill(): void {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        title: 'ยืนยันขอบิล',
        message: 'ต้องการเช็คบิลเพื่อชำระเงินใช่ไหม?',
        confirmLabel: 'ขอบิล',
      },
      showHeader: false,
      styleClass: 'alert-dialog',
      modal: true,
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
          this.messageService.add({
            severity: 'success',
            summary: 'ขอบิลสำเร็จ',
            detail: 'กรุณารอพนักงานจัดเตรียมบิล',
            life: 3000,
          });
          this.router.navigate(['/bill/waiting'], { replaceUrl: true });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: err?.error?.message || 'ไม่สามารถขอบิลได้',
            life: 5000,
          });
        },
      });
  }

  private startCooldown(): void {
    this.waiterCooldown.set(COOLDOWN_SECONDS);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const next = this.waiterCooldown() - 1;
      this.waiterCooldown.set(next);
      if (next <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }
}
