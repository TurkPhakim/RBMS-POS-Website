import { Component, computed, signal } from '@angular/core';

import {
  KitchenOptionModel,
  KitchenOrderItemModel,
  KitchenOrderModel,
} from '@app/core/api/models';

const VIEW_TABS: ViewTab[] = [
  { mode: 'order', label: 'ตามออเดอร์', icon: 'order-dinner' },
  { mode: 'menu', label: 'ตามเมนู', icon: 'menu-bar' },
];

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60000).toISOString();
}

function buildMockOrders(): MockKitchenOrder[] {
  return [
    // --- Order 1: โต๊ะ 7 — Mixed (Sent + Preparing + Ready) ---
    {
      orderId: 1,
      tableName: '7',
      zoneName: 'ชั้น 1',
      orderNumber: 'ORD-20260324-0001',
      tableId: 1,
      items: [
        {
          orderItemId: 1,
          menuId: 1,
          menuNameThai: 'ข้าวผัดกุ้ง',
          categoryType: 1,
          quantity: 2,
          status: 'Sent',
          sentToKitchenAt: minutesAgo(3),
          options: [
            { optionGroupName: 'เพิ่มเติม', optionItemName: 'ไข่ดาว' },
            { optionGroupName: 'ระดับความเผ็ด', optionItemName: 'ไม่เผ็ด' },
          ],
        },
        {
          orderItemId: 2,
          menuId: 2,
          menuNameThai: 'ต้มยำกุ้ง',
          categoryType: 1,
          quantity: 1,
          status: 'Preparing',
          sentToKitchenAt: minutesAgo(8),
          cookingStartedAt: minutesAgo(5),
          note: 'ขอเผ็ดมาก',
        },
        {
          orderItemId: 3,
          menuId: 3,
          menuNameThai: 'ผัดไทย',
          categoryType: 1,
          quantity: 1,
          status: 'Ready',
          sentToKitchenAt: minutesAgo(15),
          cookingStartedAt: minutesAgo(12),
          readyAt: minutesAgo(2),
        },
        {
          orderItemId: 14,
          menuId: 5,
          menuNameThai: 'ข้าวเปล่า',
          categoryType: 1,
          quantity: 1,
          status: 'Sent',
          sentToKitchenAt: minutesAgo(3),
        },
        {
          orderItemId: 15,
          menuId: 13,
          menuNameThai: 'ผัดซีอิ๊ว',
          categoryType: 1,
          quantity: 1,
          status: 'Cancelled',
          sentToKitchenAt: minutesAgo(6),
          cancelReason: 'วัตถุดิบหมด',
          cancelledByName: 'วิภา',
        },
      ],
    },

    // --- Order 2: โต๊ะ A1 — Warning time (12 min) ---
    {
      orderId: 2,
      tableName: 'A1',
      zoneName: 'ชั้น 1',
      orderNumber: 'ORD-20260324-0002',
      tableId: 2,
      items: [
        {
          orderItemId: 4,
          menuId: 4,
          menuNameThai: 'แกงเขียวหวาน',
          categoryType: 1,
          quantity: 3,
          status: 'Preparing',
          sentToKitchenAt: minutesAgo(12),
          cookingStartedAt: minutesAgo(9),
        },
        {
          orderItemId: 5,
          menuId: 5,
          menuNameThai: 'ข้าวเปล่า',
          categoryType: 1,
          quantity: 1,
          status: 'Preparing',
          sentToKitchenAt: minutesAgo(12),
          cookingStartedAt: minutesAgo(9),
        },
      ],
    },

    // --- Order 3: โต๊ะ 3 — Danger time! (18 min) ---
    {
      orderId: 3,
      tableName: '3',
      zoneName: 'ดาดฟ้า',
      orderNumber: 'ORD-20260324-0003',
      tableId: 3,
      items: [
        {
          orderItemId: 6,
          menuId: 6,
          menuNameThai: 'สเต็กหมู',
          categoryType: 1,
          quantity: 1,
          status: 'Preparing',
          sentToKitchenAt: minutesAgo(18),
          cookingStartedAt: minutesAgo(15),
        },
        {
          orderItemId: 7,
          menuId: 7,
          menuNameThai: 'สลัดผัก',
          categoryType: 1,
          quantity: 2,
          status: 'Preparing',
          sentToKitchenAt: minutesAgo(18),
          cookingStartedAt: minutesAgo(15),
        },
        {
          orderItemId: 16,
          menuId: 14,
          menuNameThai: 'ไก่ย่าง',
          categoryType: 1,
          quantity: 1,
          status: 'Cancelled',
          sentToKitchenAt: minutesAgo(18),
          cancelReason: 'ลูกค้าเปลี่ยนใจ',
          cancelledByName: 'สมชาย',
        },
      ],
    },

    // --- Order 4: โต๊ะ 12 — Fresh (1 min) ---
    {
      orderId: 4,
      tableName: '12',
      zoneName: 'ชั้น 2',
      orderNumber: 'ORD-20260324-0004',
      tableId: 4,
      items: [
        {
          orderItemId: 8,
          menuId: 8,
          menuNameThai: 'ข้าวมันไก่',
          categoryType: 1,
          quantity: 1,
          status: 'Sent',
          sentToKitchenAt: minutesAgo(1),
        },
        {
          orderItemId: 9,
          menuId: 9,
          menuNameThai: 'ก๋วยเตี๋ยวต้มยำ',
          categoryType: 1,
          quantity: 1,
          status: 'Sent',
          sentToKitchenAt: minutesAgo(1),
          options: [
            { optionGroupName: 'ประเภทเส้น', optionItemName: 'เส้นเล็ก' },
            { optionGroupName: 'เนื้อสัตว์', optionItemName: 'หมูสับ' },
          ],
        },
      ],
    },

    // --- Order 5: โต๊ะ B2 — Note ยาว ---
    {
      orderId: 5,
      tableName: 'B2',
      zoneName: 'ชั้น 2',
      orderNumber: 'ORD-20260324-0005',
      tableId: 5,
      items: [
        {
          orderItemId: 10,
          menuId: 10,
          menuNameThai: 'ข้าวคลุกกะปิ',
          categoryType: 1,
          quantity: 1,
          status: 'Sent',
          sentToKitchenAt: minutesAgo(5),
          note: 'ไม่ใส่พริก ไม่ใส่กุ้งแห้ง',
        },
      ],
    },

    // --- Order 6: โต๊ะ 5 — Ready ---
    {
      orderId: 6,
      tableName: '5',
      zoneName: 'ชั้น 1',
      orderNumber: 'ORD-20260324-0006',
      tableId: 6,
      items: [
        {
          orderItemId: 11,
          menuId: 11,
          menuNameThai: 'ผัดกะเพราหมูสับ',
          categoryType: 1,
          quantity: 2,
          status: 'Ready',
          sentToKitchenAt: minutesAgo(20),
          cookingStartedAt: minutesAgo(15),
          readyAt: minutesAgo(3),
        },
        {
          orderItemId: 12,
          menuId: 5,
          menuNameThai: 'ข้าวเปล่า',
          categoryType: 1,
          quantity: 1,
          status: 'Ready',
          sentToKitchenAt: minutesAgo(20),
          readyAt: minutesAgo(3),
        },
      ],
    },

    // --- Order 7: โต๊ะ 9 — Ready with options ---
    {
      orderId: 7,
      tableName: '9',
      zoneName: 'ดาดฟ้า',
      orderNumber: 'ORD-20260324-0007',
      tableId: 7,
      items: [
        {
          orderItemId: 13,
          menuId: 12,
          menuNameThai: 'ข้าวผัดปู',
          categoryType: 1,
          quantity: 1,
          status: 'Ready',
          sentToKitchenAt: minutesAgo(25),
          cookingStartedAt: minutesAgo(20),
          readyAt: minutesAgo(5),
          options: [
            { optionGroupName: 'หมายเหตุ', optionItemName: 'ไม่ใส่ต้นหอม' },
          ],
        },
      ],
    },
  ];
}

@Component({
  selector: 'app-test-kitchen-display',
  standalone: false,
  templateUrl: './test-kitchen-display.component.html',
})
export class TestKitchenDisplayComponent {
  readonly orders = signal<MockKitchenOrder[]>(buildMockOrders());
  readonly viewTabs = VIEW_TABS;
  readonly viewMode = signal<'order' | 'menu'>('order');
  canUpdate = true;

  readonly pendingOrders = computed(() =>
    this.orders().filter((o) =>
      o.items?.some((i) => i.status === 'Sent' || i.status === 'Preparing'),
    ),
  );

  readonly readyOrders = computed(() =>
    this.orders().filter(
      (o) =>
        o.items?.some((i) => i.status === 'Ready') &&
        !o.items?.some((i) => i.status === 'Sent' || i.status === 'Preparing'),
    ),
  );

  readonly pendingMenuGroups = computed(() => this.buildMenuGroups('pending'));
  readonly readyMenuGroups = computed(() => this.buildMenuGroups('ready'));

  // KPI computed signals
  readonly totalSent = computed(() =>
    this.orders().reduce(
      (sum, o) =>
        sum + (o.items ?? []).filter((i) => i.status === 'Sent').length,
      0,
    ),
  );

  readonly totalPreparing = computed(() =>
    this.orders().reduce(
      (sum, o) =>
        sum + (o.items ?? []).filter((i) => i.status === 'Preparing').length,
      0,
    ),
  );

  readonly totalReady = computed(() =>
    this.orders().reduce(
      (sum, o) =>
        sum + (o.items ?? []).filter((i) => i.status === 'Ready').length,
      0,
    ),
  );

  readonly totalCancelled = computed(() =>
    this.orders().reduce(
      (sum, o) =>
        sum + (o.items ?? []).filter((i) => i.status === 'Cancelled').length,
      0,
    ),
  );

  // --- View Mode ---

  toggleViewMode(mode: 'order' | 'menu'): void {
    this.viewMode.set(mode);
  }

  // --- Order View helpers ---

  hasSentItems(order: MockKitchenOrder): boolean {
    return (order.items ?? []).some((i) => i.status === 'Sent');
  }

  hasPreparingItems(order: MockKitchenOrder): boolean {
    return (order.items ?? []).some((i) => i.status === 'Preparing');
  }

  getPendingItems(order: MockKitchenOrder): KitchenOrderItemModel[] {
    return (order.items ?? []).filter(
      (i) => i.status === 'Sent' || i.status === 'Preparing',
    );
  }

  getReadyItems(order: MockKitchenOrder): KitchenOrderItemModel[] {
    return (order.items ?? []).filter((i) => i.status === 'Ready');
  }

  getCancelledItems(order: MockKitchenOrder): MockKitchenOrderItem[] {
    return (order.items ?? []).filter((i) => i.status === 'Cancelled');
  }

  hasCancelledItems(order: MockKitchenOrder): boolean {
    return (order.items ?? []).some((i) => i.status === 'Cancelled');
  }

  // --- Actions (local state only) ---

  startPreparing(item: KitchenOrderItemModel): void {
    this.updateItemStatus(item.orderItemId!, 'Preparing');
  }

  startPreparingAll(order: MockKitchenOrder): void {
    const ids = (order.items ?? [])
      .filter((i) => i.status === 'Sent')
      .map((i) => i.orderItemId!);
    ids.forEach((id) => this.updateItemStatus(id, 'Preparing'));
  }

  markReady(item: KitchenOrderItemModel): void {
    this.updateItemStatus(item.orderItemId!, 'Ready');
  }

  markReadyAll(order: MockKitchenOrder): void {
    const ids = (order.items ?? [])
      .filter((i) => i.status === 'Preparing')
      .map((i) => i.orderItemId!);
    ids.forEach((id) => this.updateItemStatus(id, 'Ready'));
  }

  // --- Menu View helpers ---

  hasSentGroupItems(group: MenuGroup): boolean {
    return group.items.some((i) => i.status === 'Sent');
  }

  hasPreparingGroupItems(group: MenuGroup): boolean {
    return group.items.some((i) => i.status === 'Preparing');
  }

  getSentCount(group: MenuGroup): number {
    return group.items
      .filter((i) => i.status === 'Sent')
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  getPreparingCount(group: MenuGroup): number {
    return group.items
      .filter((i) => i.status === 'Preparing')
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  startPreparingGroup(group: MenuGroup): void {
    group.items
      .filter((i) => i.status === 'Sent')
      .forEach((i) => this.updateItemStatus(i.orderItemId, 'Preparing'));
  }

  markReadyGroup(group: MenuGroup): void {
    group.items
      .filter((i) => i.status === 'Preparing')
      .forEach((i) => this.updateItemStatus(i.orderItemId, 'Ready'));
  }

  getReadyCount(group: MenuGroup): number {
    return group.items
      .filter((i) => i.status === 'Ready')
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  startPreparingItem(item: MenuGroupItem): void {
    this.updateItemStatus(item.orderItemId, 'Preparing');
  }

  markReadyItem(item: MenuGroupItem): void {
    this.updateItemStatus(item.orderItemId, 'Ready');
  }

  // --- Shared helpers ---

  getElapsedMinutes(dateStr: string | null | undefined): number {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  }

  getTimeBadgeClass(minutes: number): string {
    if (minutes >= 15) return 'bg-danger/50 text-white';
    if (minutes >= 10) return 'bg-warning-dark/50 text-white';
    return 'bg-surface-hover text-surface-sub';
  }

  // --- Reset mock data ---

  resetData(): void {
    this.orders.set(buildMockOrders());
  }

  // --- Private ---

  private updateItemStatus(orderItemId: number, newStatus: string): void {
    const now = new Date().toISOString();
    const updated = this.orders().map((order) => ({
      ...order,
      items: (order.items ?? []).map((item) =>
        item.orderItemId === orderItemId
          ? {
              ...item,
              status: newStatus,
              cookingStartedAt:
                newStatus === 'Preparing' ? now : item.cookingStartedAt,
              readyAt: newStatus === 'Ready' ? now : item.readyAt,
            }
          : item,
      ),
    }));
    this.orders.set(updated);
  }

  private buildMenuGroups(mode: 'pending' | 'ready'): MenuGroup[] {
    const statusFilter =
      mode === 'pending'
        ? (s: string) => s === 'Sent' || s === 'Preparing'
        : (s: string) => s === 'Ready';

    const groups = new Map<string, MenuGroup>();

    for (const order of this.orders()) {
      for (const item of order.items ?? []) {
        if (!statusFilter(item.status!)) continue;

        const key = this.getMenuGroupKey(item);
        if (!groups.has(key)) {
          groups.set(key, {
            groupKey: key,
            menuNameThai: item.menuNameThai ?? '',
            options: item.options ?? [],
            items: [],
          });
        }

        groups.get(key)!.items.push({
          orderItemId: item.orderItemId!,
          tableName: order.tableName ?? '',
          zoneName: order.zoneName ?? '',
          quantity: item.quantity ?? 0,
          note: item.note ?? null,
          status: item.status!,
          sentToKitchenAt: item.sentToKitchenAt ?? null,
          cookingStartedAt: item.cookingStartedAt ?? null,
        });
      }
    }

    for (const group of groups.values()) {
      group.items.sort((a, b) => {
        const aTime = a.sentToKitchenAt
          ? new Date(a.sentToKitchenAt).getTime()
          : 0;
        const bTime = b.sentToKitchenAt
          ? new Date(b.sentToKitchenAt).getTime()
          : 0;
        return aTime - bTime;
      });
    }

    return Array.from(groups.values()).sort((a, b) => {
      const aOldest = a.items[0]?.sentToKitchenAt
        ? new Date(a.items[0].sentToKitchenAt).getTime()
        : 0;
      const bOldest = b.items[0]?.sentToKitchenAt
        ? new Date(b.items[0].sentToKitchenAt).getTime()
        : 0;
      return aOldest - bOldest;
    });
  }

  private getMenuGroupKey(item: KitchenOrderItemModel): string {
    const optionsKey = (item.options ?? [])
      .map((o) => `${o.optionGroupName}:${o.optionItemName}`)
      .sort()
      .join('|');
    return `${item.menuId}_${optionsKey}`;
  }
}

interface MenuGroupItem {
  orderItemId: number;
  tableName: string;
  zoneName: string;
  quantity: number;
  note: string | null;
  status: string;
  sentToKitchenAt: string | null;
  cookingStartedAt: string | null;
}

interface MenuGroup {
  groupKey: string;
  menuNameThai: string;
  options: KitchenOptionModel[];
  items: MenuGroupItem[];
}

interface MockKitchenOrderItem extends KitchenOrderItemModel {
  cancelledByName?: string;
}

interface MockKitchenOrder extends Omit<KitchenOrderModel, 'items'> {
  zoneName?: string;
  items?: MockKitchenOrderItem[] | null;
}

interface ViewTab {
  mode: 'order' | 'menu';
  label: string;
  icon: string;
}
