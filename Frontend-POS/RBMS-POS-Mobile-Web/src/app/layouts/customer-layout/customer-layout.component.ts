import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { CustomerAuthService } from '@core/services/customer-auth.service';
import { CartService } from '@core/services/cart.service';
import { SignalRService } from '@core/services/signalr.service';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog/confirm-dialog.component';
import { CustomerAuthResponseModel } from '@core/api/models/customer-auth-response-model';
import { environment } from '@env/environment';

const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-customer-layout',
  standalone: false,
  providers: [DialogService],
  template: `
    <div class="flex flex-col min-h-screen bg-surface">
      <!-- Header -->
      <header class="bg-gradient-to-r from-primary to-primary-dark sticky top-0 z-10">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 flex items-center justify-center overflow-hidden"
              [ngClass]="logoUrl ? 'rounded-xl' : 'bg-white rounded-full p-0.5'"
            >
              <img
                [src]="logoUrl || 'images/RBMS_Logo.png'"
                alt="Logo"
                class="w-full h-full object-contain"
                [class.rounded-xl]="!!logoUrl"
              >
            </div>
            <div>
              <span class="font-bold text-2xl text-white leading-tight block">{{ session?.shopNameThai || 'ร้านอาหาร' }}</span>
              @if (session?.shopNameEnglish) {
                <span class="text-xl text-white/70 leading-tight block">{{ session?.shopNameEnglish }}</span>
              }
              <span class="text-lg text-white/70 leading-tight block mt-0.5">โซน{{ session?.zoneName }} - โต๊ะ{{ session?.tableName }}</span>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            @if (!isBillPage()) {
              <button
                class="w-14 h-14 rounded-full bg-info flex items-center justify-center transition-colors"
                [class.opacity-50]="billRequested()"
                [disabled]="billRequested()"
                (click)="requestBill()"
                pTooltip="ขอบิล"
                tooltipPosition="left"
              >
                <app-generic-icon name="receipt" svgClass="w-7 h-7" class="text-white"></app-generic-icon>
              </button>
            }
            <button
              class="w-14 h-14 rounded-full bg-success-dark flex items-center justify-center transition-colors relative"
              [class.opacity-50]="waiterCooldown() > 0"
              [disabled]="waiterCooldown() > 0"
              (click)="callWaiter()"
              pTooltip="เรียกพนักงาน"
              tooltipPosition="left"
            >
              <app-generic-icon name="raise-hand" svgClass="w-7 h-7" class="text-white"></app-generic-icon>
              @if (waiterCooldown() > 0) {
                <span class="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {{ waiterCooldown() }}
                </span>
              }
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto pb-[70px]">
        <router-outlet></router-outlet>

        <!-- Footer — ข้อมูลติดต่อร้าน -->
        @if (hasContactInfo) {
          <footer class="mt-8 bg-gradient-to-br from-primary to-primary-badge">
            <div class="bg-black/15 px-5 py-3 mb-1 flex items-center gap-3">
              <span class="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                <app-generic-icon name="restaurant" svgClass="w-6 h-6" class="text-white"></app-generic-icon>
              </span>
              <span class="font-extrabold text-2xl text-white tracking-wider uppercase">ข้อมูลติดต่อร้าน</span>
            </div>
            <div class="px-5 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5">
              @if (session?.address) {
                <div class="flex items-start gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <app-generic-icon name="address-location" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white leading-snug">{{ session!.address }}</span>
                </div>
              }
              @if (session?.website) {
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <app-generic-icon name="web" svgClass="w-5 h-5" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white">{{ session!.website }}</span>
                </div>
              }
              @if (session?.phoneNumber) {
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <app-generic-icon name="telephone" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white">{{ session!.phoneNumber }}</span>
                </div>
              }
              @if (session?.facebook) {
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <app-generic-icon name="facebook" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white">{{ session!.facebook }}</span>
                </div>
              }
              @if (session?.shopEmail) {
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <app-generic-icon name="email" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white">{{ session!.shopEmail }}</span>
                </div>
              }
              @if (session?.instagram) {
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <app-generic-icon name="instagram" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
                  </span>
                  <span class="text-white">{{ session!.instagram }}</span>
                </div>
              }
            </div>
          </footer>
        }
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-border z-20">
        <div class="flex items-center justify-around h-[66px] max-w-lg mx-auto">
          <a routerLink="/menu" routerLinkActive #menuLink="routerLinkActive"
             class="flex flex-col items-center justify-center gap-1 w-20 py-1.5 rounded-xl transition-colors"
             [class]="menuLink.isActive ? 'text-primary bg-primary-subtle' : 'text-surface-sub'">
            <app-generic-icon name="menu-list" svgClass="w-6 h-6"></app-generic-icon>
            <span class="text-[11px] font-semibold">เมนู</span>
          </a>
          <a routerLink="/cart" routerLinkActive #cartLink="routerLinkActive"
             class="flex flex-col items-center justify-center gap-1 w-20 py-1.5 rounded-xl transition-colors relative"
             [class]="cartLink.isActive ? 'text-primary bg-primary-subtle' : 'text-surface-sub'">
            <app-generic-icon name="basket-shopping" svgClass="w-6 h-6"></app-generic-icon>
            @if (cartService.itemCount() > 0) {
              <span class="absolute top-0.5 right-1 bg-danger text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {{ cartService.itemCount() }}
              </span>
            }
            <span class="text-[11px] font-semibold">ตะกร้า</span>
          </a>
          <a routerLink="/orders" routerLinkActive #ordersLink="routerLinkActive"
             class="flex flex-col items-center justify-center gap-1 w-20 py-1.5 rounded-xl transition-colors"
             [class]="ordersLink.isActive ? 'text-primary bg-primary-subtle' : 'text-surface-sub'">
            <app-generic-icon name="order-dinner" svgClass="w-6 h-6"></app-generic-icon>
            <span class="text-[11px] font-semibold">ออเดอร์</span>
          </a>
        </div>
      </nav>

      <!-- Toast -->
      <p-toast position="top-center"></p-toast>
    </div>
  `,
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  session: CustomerAuthResponseModel | null;
  logoUrl: string | null = null;
  hasContactInfo = false;
  waiterCooldown = signal(0);
  billRequested = signal(false);
  isBillPage = signal(false);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private customerAuth: CustomerAuthService,
    public cartService: CartService,
    private signalR: SignalRService,
    private selfOrderService: SelfOrderService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
    this.session = this.customerAuth.getSession();
    if (this.session?.logoFileId) {
      this.logoUrl = `${environment.apiUrl}/api/admin/file/${this.session.logoFileId}`;
    }
    this.hasContactInfo = !!(this.session?.address || this.session?.phoneNumber || this.session?.shopEmail || this.session?.facebook || this.session?.instagram || this.session?.website);
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isBillPage.set(event.urlAfterRedirects.startsWith('/bill'));
      }
    });
  }

  ngOnInit(): void {
    this.signalR.connect();
    this.scheduleAutoExpiry();
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
