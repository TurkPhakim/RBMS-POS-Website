import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { NotificationResponseModel } from '@app/core/api/models';
import { NotiStoreService } from '@app/core/services/noti-store.service';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-notification-drawer',
  standalone: false,
  templateUrl: './notification-drawer.component.html',
})
export class NotificationDrawerComponent {
  readonly filterRow1 = FILTER_ROW_1;
  readonly filterRow2 = FILTER_ROW_2;
  readonly emptyLottie: AnimationOptions = {
    path: 'animations/bell-notification.json',
  };

  constructor(
    public readonly notiStore: NotiStoreService,
    private readonly router: Router,
    private readonly modalService: ModalService,
  ) {}

  getIconData(eventType: string | null | undefined) {
    return ICON_MAP[eventType ?? ''] ?? DEFAULT_ICON;
  }

  isPiIcon(eventType: string | null | undefined): boolean {
    return this.getIconData(eventType).icon.startsWith('pi ');
  }

  onClickItem(noti: NotificationResponseModel): void {
    if (!noti.isRead && noti.notificationId) {
      this.notiStore.markRead(noti.notificationId);
    }
    this.notiStore.closeDrawer();

    const navFn = NAV_MAP[noti.eventType ?? ''];
    if (navFn) {
      this.router.navigate(navFn(noti));
    }
  }

  onClearAll(): void {
    this.modalService.info({
      title: 'เคลียร์การแจ้งเตือน',
      message: 'ต้องการเคลียร์การแจ้งเตือนทั้งหมดหรือไม่?',
      onConfirm: () => this.notiStore.clearAll(),
    });
  }

  relativeTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'เมื่อสักครู่';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  }
}

interface FilterChip {
  label: string;
  value: string | null;
  icon: string;
  piIcon: boolean;
  activeBg: string;
}

const FILTER_ROW_1: FilterChip[] = [
  {
    label: 'ทั้งหมด',
    value: null,
    icon: 'bell',
    piIcon: false,
    activeBg: 'bg-surface-dark',
  },
  {
    label: 'ออเดอร์พร้อมเสิร์ฟ',
    value: 'ORDER_READY',
    icon: 'food',
    piIcon: false,
    activeBg: 'bg-success',
  },
];

const FILTER_ROW_2: FilterChip[] = [
  {
    label: 'ออเดอร์',
    value: 'NEW_ORDER',
    icon: 'order-dinner',
    piIcon: false,
    activeBg: 'bg-primary',
  },
  {
    label: 'เรียกพนักงาน',
    value: 'CALL_WAITER',
    icon: 'food-waiter',
    piIcon: false,
    activeBg: 'bg-warning-dark',
  },
  {
    label: 'ชำระเงิน',
    value: 'REQUEST_BILL',
    icon: 'bill-rastaurant',
    piIcon: false,
    activeBg: 'bg-info',
  },
];

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  NEW_ORDER: { icon: 'order-dinner', color: 'text-primary' },
  ORDER_READY: { icon: 'food', color: 'text-success' },
  CALL_WAITER: { icon: 'food-waiter', color: 'text-warning-dark' },
  REQUEST_BILL: { icon: 'bill-rastaurant', color: 'text-info' },
  RESERVATION_REMINDER: { icon: 'reservation', color: 'text-warning-dark' },
  ORDER_CANCELLED: { icon: 'cancel', color: 'text-danger' },
  SLIP_UPLOADED: { icon: 'receipt', color: 'text-info' },
  PAYMENT_COMPLETED: { icon: 'payment-complete', color: 'text-success' },
};

const DEFAULT_ICON = { icon: 'bell', color: 'text-primary' };

const NAV_MAP: Record<string, (n: NotificationResponseModel) => string[]> = {
  NEW_ORDER: (n) => ['/order', String(n.orderId)],
  ORDER_READY: (n) => ['/order', String(n.orderId)],
  CALL_WAITER: (n) => ['/table/floor-plan', String(n.tableId)],
  REQUEST_BILL: (n) => ['/payment/process', String(n.orderId)],
  RESERVATION_REMINDER: (n) => [
    '/table/reservations/update',
    String(n.reservationId),
  ],
  ORDER_CANCELLED: (n) => ['/order', String(n.orderId)],
  SLIP_UPLOADED: (n) => ['/payment/process', String(n.orderId)],
  PAYMENT_COMPLETED: () => ['/table/floor-plan'],
};
