import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { NotificationSignalRService } from '@app/core/services/notification-signalr.service';
import { SessionTimeoutService } from '@app/core/services/session-timeout.service';

const TOAST_ICONS: Record<string, { icon: string; color: string }> = {
  NEW_ORDER: { icon: 'order-dinner', color: 'text-primary' },
  ORDER_READY: { icon: 'food', color: 'text-success' },
  CALL_WAITER: { icon: 'food-waiter', color: 'text-warning-dark' },
  REQUEST_BILL: { icon: 'bill-rastaurant', color: 'text-info' },
  REQUEST_SPLIT_BILL: { icon: 'bill-splitting', color: 'text-info' },
  ORDER_CANCELLED: { icon: 'cancel', color: 'text-danger' },
  SLIP_UPLOADED: { icon: 'receipt', color: 'text-info' },
  REQUEST_CASH_PAYMENT: { icon: 'bill-rastaurant', color: 'text-success' },
  PAYMENT_COMPLETED: { icon: 'payment-complete', color: 'text-success' },
  RESERVATION_REMINDER: { icon: 'reservation', color: 'text-warning-dark' },
};

const DEFAULT_ICON = { icon: 'bell', color: 'text-primary' };

const TOAST_NAV_MAP: Record<string, (data: Record<string, unknown>) => { route: string[]; extras?: Record<string, unknown> }> = {
  NEW_ORDER: (d) => ({ route: ['/order/list', String(d['orderId'])] }),
  ORDER_READY: (d) => ({ route: ['/order/list', String(d['orderId'])] }),
  CALL_WAITER: () => ({ route: ['/order/overview'] }),
  REQUEST_BILL: (d) => ({ route: ['/payment/checkout', String(d['orderId'])] }),
  REQUEST_SPLIT_BILL: (d) => ({ route: ['/payment/checkout', String(d['orderId'])] }),
  ORDER_CANCELLED: (d) => ({ route: ['/order/list', String(d['orderId'])] }),
  SLIP_UPLOADED: (d) => ({ route: ['/payment/checkout', String(d['orderId'])], extras: { queryParams: { openSlip: true } } }),
  REQUEST_CASH_PAYMENT: (d) => ({ route: ['/payment/checkout', String(d['orderId'])] }),
  PAYMENT_COMPLETED: () => ({ route: ['/order/overview'] }),
  RESERVATION_REMINDER: () => ({ route: ['/table/reservations'] }),
};

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly notificationSignalR: NotificationSignalRService,
    private readonly sessionTimeout: SessionTimeoutService,
    private readonly messageService: MessageService,
  ) {}

  onToastClick(msg: ToastMessageOptions): void {
    this.messageService.clear('noti');
    const navFn = TOAST_NAV_MAP[msg.data?.eventType ?? ''];
    if (navFn) {
      const nav = navFn(msg.data ?? {});
      this.router.navigate(nav.route, nav.extras);
    }
  }

  closeToast(): void {
    this.messageService.clear('noti');
  }

  getToastIcon(msg: ToastMessageOptions) {
    return TOAST_ICONS[msg.data?.eventType ?? ''] ?? DEFAULT_ICON;
  }

  isPiIcon(msg: ToastMessageOptions): boolean {
    return this.getToastIcon(msg).icon.startsWith('pi ');
  }

  getMessageLines(detail: string | null | undefined): string[] {
    if (!detail) return [''];
    return detail.split('\n');
  }

  ngOnInit(): void {
    this.sessionTimeout.start();
    this.notificationSignalR.connect();
  }

  ngOnDestroy(): void {
    this.sessionTimeout.stop();
    this.notificationSignalR.disconnect();
  }
}
