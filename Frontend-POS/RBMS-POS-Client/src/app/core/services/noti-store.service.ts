import { computed, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NotificationResponseModel } from '@app/core/api/models';
import { NotificationsService } from '@app/core/api/services';

const TOAST_EVENT_TYPES = [
  'NEW_ORDER',
  'ORDER_READY',
  'CALL_WAITER',
  'REQUEST_BILL',
  'RESERVATION_REMINDER',
  'ORDER_CANCELLED',
  'SLIP_UPLOADED',
  'PAYMENT_COMPLETED',
];

const FILTER_GROUPS: Record<string, string[]> = {
  NEW_ORDER: ['NEW_ORDER', 'ORDER_CANCELLED'],
  ORDER_READY: ['ORDER_READY'],
  CALL_WAITER: ['CALL_WAITER'],
  REQUEST_BILL: ['REQUEST_BILL', 'SLIP_UPLOADED', 'PAYMENT_COMPLETED'],
};

@Injectable({ providedIn: 'root' })
export class NotiStoreService {
  readonly notifications = signal<NotificationResponseModel[]>([]);
  readonly isDrawerOpen = signal(false);
  readonly activeFilter = signal<string | null>(null);
  readonly tableFilter = signal<number | null>(null);

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length,
  );

  readonly filteredNotifications = computed(() => {
    let items = this.notifications();
    const eventType = this.activeFilter();
    const tableId = this.tableFilter();
    if (eventType) {
      const group = FILTER_GROUPS[eventType] ?? [eventType];
      items = items.filter((n) => group.includes(n.eventType ?? ''));
    }
    if (tableId != null) items = items.filter((n) => n.tableId === tableId);
    return items;
  });

  readonly availableTables = computed(() => {
    const unique = new Map<number, { name: string; zoneName: string | null }>();
    this.notifications()
      .filter((n) => n.tableId != null && n.tableName)
      .forEach((n) => {
        if (!unique.has(n.tableId!)) {
          unique.set(n.tableId!, {
            name: n.tableName!,
            zoneName: n.zoneName ?? null,
          });
        }
      });
    return Array.from(unique, ([id, { name, zoneName }]) => ({
      id,
      name,
      zoneName,
    }));
  });

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly messageService: MessageService,
  ) {}

  addNotification(noti: NotificationResponseModel): void {
    this.notifications.update((list) => [noti, ...list]);

    if (
      !this.isDrawerOpen() &&
      TOAST_EVENT_TYPES.includes(noti.eventType ?? '')
    ) {
      this.messageService.add({
        key: 'noti',
        severity: 'info',
        summary: noti.title ?? '',
        detail: noti.message ?? '',
        life: 5000,
        data: { eventType: noti.eventType, tableName: noti.tableName, zoneName: noti.zoneName },
      });
    }
  }

  loadNotifications(): void {
    this.notificationsService
      .notificationsGetNotificationsGet({ limit: 50 })
      .subscribe((res) => this.notifications.set(res.results ?? []));
  }

  markRead(notificationId: number): void {
    this.notificationsService
      .notificationsMarkReadPatch({ notificationId })
      .subscribe(() => {
        this.notifications.update((list) =>
          list.map((n) =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n,
          ),
        );
      });
  }

  markAllRead(): void {
    this.notificationsService.notificationsMarkAllReadPatch().subscribe(() => {
      this.notifications.update((list) =>
        list.map((n) => ({ ...n, isRead: true })),
      );
    });
  }

  clearAll(): void {
    this.notificationsService.notificationsClearAllDelete().subscribe(() => {
      this.notifications.set([]);
    });
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  setFilter(eventType: string | null): void {
    this.activeFilter.set(eventType);
  }

  setTableFilter(tableId: number | null): void {
    this.tableFilter.set(tableId);
  }
}
