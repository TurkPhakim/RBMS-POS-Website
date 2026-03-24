import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { NotificationSignalRService } from '@app/core/services/notification-signalr.service';
import { SessionTimeoutService } from '@app/core/services/session-timeout.service';

const TOAST_ICONS: Record<string, { icon: string; color: string }> = {
  NEW_ORDER: { icon: 'order-dinner', color: 'text-primary' },
  ORDER_READY: { icon: 'food', color: 'text-success' },
  CALL_WAITER: { icon: 'food-waiter', color: 'text-warning-dark' },
  REQUEST_BILL: { icon: 'bill-rastaurant', color: 'text-info' },
  ORDER_CANCELLED: { icon: 'cancel', color: 'text-danger' },
  SLIP_UPLOADED: { icon: 'receipt', color: 'text-info' },
  PAYMENT_COMPLETED: { icon: 'payment-complete', color: 'text-success' },
  RESERVATION_REMINDER: { icon: 'reservation', color: 'text-warning-dark' },
};

const DEFAULT_ICON = { icon: 'bell', color: 'text-primary' };

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  constructor(
    private readonly notificationSignalR: NotificationSignalRService,
    private readonly sessionTimeout: SessionTimeoutService,
    private readonly messageService: MessageService,
  ) {}

  closeToast(): void {
    this.messageService.clear('noti');
  }

  getToastIcon(msg: ToastMessageOptions) {
    return TOAST_ICONS[msg.data?.eventType ?? ''] ?? DEFAULT_ICON;
  }

  isPiIcon(msg: ToastMessageOptions): boolean {
    return this.getToastIcon(msg).icon.startsWith('pi ');
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
