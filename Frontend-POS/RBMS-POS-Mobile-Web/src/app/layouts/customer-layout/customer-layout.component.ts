import { Component, DestroyRef, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { CartService } from '@core/services/cart.service';
import { SignalRService } from '@core/services/signalr.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ModalService, Icon } from '@core/services/modal.service';
import { CustomerAuthResponseModel } from '@core/api/models/customer-auth-response-model';
import { environment } from '@env/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { NicknameDialogComponent } from '@shared/dialogs/nickname-dialog/nickname-dialog.component';

const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-customer-layout',
  standalone: false,
  templateUrl: './customer-layout.component.html',
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  session: CustomerAuthResponseModel | null;
  logoUrl: string | null = null;
  hasContactInfo = false;
  nickname = signal('');
  waiterCooldown = signal(0);
  hasServedItems = signal(false);
  isBilling = signal(false);
  isBillPage = signal(false);
  isCartPage = signal(false);
  isPaymentCompletePage = signal(false);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private customerAuth: CustomerAuthService,
    public cartService: CartService,
    private signalR: SignalRService,
    private selfOrderService: SelfOrderService,
    private modalService: ModalService,
    private dialogService: DialogService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.session = this.customerAuth.getSession();
    this.nickname.set(this.session?.nickname || '');
    if (this.session?.logoFileId) {
      this.logoUrl = `${environment.apiUrl}/api/admin/file/${this.session.logoFileId}`;
    }
    this.hasContactInfo = !!(this.session?.address || this.session?.phoneNumber || this.session?.shopEmail || this.session?.facebook || this.session?.instagram || this.session?.website);
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isBillPage.set(event.urlAfterRedirects.startsWith('/bill'));
        this.isCartPage.set(event.urlAfterRedirects.startsWith('/cart'));
        this.isPaymentCompletePage.set(event.urlAfterRedirects.startsWith('/bill/complete'));
      }
    });
    effect(() => {
      this.signalR.refreshOrders();
      this.checkServedItems();
    });
    effect(() => {
      const count = this.signalR.billVoided();
      if (count > 0) {
        this.isBilling.set(false);
        this.modalService.info({
          title: 'ยกเลิกบิลแล้ว',
          message: 'พนักงานยกเลิกบิลแล้ว สามารถสั่งเมนูเพิ่มได้',
          confirmButtonLabel: 'ตกลง',
        }).onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          this.router.navigate(['/orders'], { replaceUrl: true });
        });
      }
    });
  }

  ngOnInit(): void {
    this.signalR.connect();
    this.scheduleAutoExpiry();
    this.restoreCooldown();
    this.checkShopStatus();
    this.checkServedItems();
    if (!this.nickname()) {
      this.openNicknameDialog();
    }
  }

  private checkServedItems(): void {
    this.selfOrderService
      .selfOrderGetOrdersGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.result?.items ?? [];
          this.hasServedItems.set(items.some(i => i.status === 'Served'));
          const status = res.result?.orderStatus;
          this.isBilling.set(status === 'Billing' || status === 'Completed');
        },
      });
  }

  private checkShopStatus(): void {
    this.selfOrderService
      .selfOrderGetShopStatusGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.result?.isOpen) {
            this.router.navigate(['/shop-closed'], { replaceUrl: true });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.signalR.disconnect();
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
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
    // ตรวจสอบสถานะก่อน — ถ้าขอบิลไปแล้วให้ redirect ไปหน้าบิลตามสถานะ
    this.selfOrderService.selfOrderGetOrdersGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const orderStatus = res.result?.orderStatus;
          const bills = res.result?.bills ?? [];

          if (orderStatus === 'Billing') {
            if (bills.length > 0) {
              this.router.navigate(['/bill/summary'], { replaceUrl: true });
            } else {
              this.router.navigate(['/bill/waiting'], { replaceUrl: true });
            }
            return;
          }

          // ยังไม่ขอบิล — แสดง confirmation dialog
          this.showBillConfirmDialog();
        },
      });
  }

  private showBillConfirmDialog(): void {
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

  private openNicknameDialog(): void {
    const ref = this.dialogService.open(NicknameDialogComponent, {
      closable: false,
      showHeader: false,
      styleClass: 'card-dialog',
      width: '85vw',
      modal: true,
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: string | undefined) => {
        if (result) {
          this.nickname.set(result);
        }
      });
  }

  private scheduleAutoExpiry(): void {
    const remainingMs = this.customerAuth.getTokenExpiryMs();
    if (remainingMs === null || remainingMs <= 0) {
      this.customerAuth.clear();
      this.router.navigate(['/expired']);
      return;
    }
    this.expiryTimer = setTimeout(() => {
      this.customerAuth.clear();
      this.router.navigate(['/expired']);
    }, remainingMs);
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
