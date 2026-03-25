import { Component, computed, DestroyRef, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { KitchenOptionModel, KitchenOrderItemModel, KitchenOrderModel } from '@app/core/api/models';
import { AuthService } from '@app/core/services/auth.service';
import { KitchenStateService } from '@app/core/services/kitchen-state.service';

const LS_VIEW_MODE_KEY = 'kds-view-mode';

const VIEW_TABS: ViewTab[] = [
  { mode: 'order', label: 'ตามออเดอร์', icon: 'order-dinner' },
  { mode: 'menu', label: 'ตามเมนู', icon: 'menu-bar' },
];

@Component({
  selector: 'app-kitchen-display',
  standalone: false,
  templateUrl: './kitchen-display.component.html',
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  readonly orders: Signal<KitchenOrderModel[]>;
  readonly pendingOrders: Signal<KitchenOrderModel[]>;
  readonly readyOrders: Signal<KitchenOrderModel[]>;
  readonly pendingMenuGroups: Signal<MenuGroup[]>;
  readonly readyMenuGroups: Signal<MenuGroup[]>;
  readonly viewTabs = VIEW_TABS;

  readonly viewMode = signal<'order' | 'menu'>(
    (localStorage.getItem(LS_VIEW_MODE_KEY) as 'order' | 'menu') || 'order',
  );

  // KPI computed signals
  readonly totalSent: Signal<number>;
  readonly totalPreparing: Signal<number>;
  readonly totalReady: Signal<number>;
  readonly totalCancelled: Signal<number>;

  pageTitle: string;
  pageIcon: string;
  canUpdate: boolean;
  private categoryType: number;

  constructor(
    private readonly authService: AuthService,
    private readonly destroyRef: DestroyRef,
    private readonly kitchenState: KitchenStateService,
    private readonly route: ActivatedRoute,
  ) {
    const data = this.route.snapshot.data;
    this.categoryType = data['categoryType'] ?? 1;
    this.pageTitle = data['pageTitle'] ?? 'ครัวอาหาร';
    this.pageIcon = data['pageIcon'] ?? 'food';
    this.canUpdate = this.authService.hasPermission(data['updatePermission'] ?? 'kitchen-food.update');

    this.orders = this.kitchenState.orders;

    this.pendingOrders = computed(() =>
      this.orders().filter((o) =>
        o.items?.some((i) => i.status === 'Sent' || i.status === 'Preparing'),
      ),
    );

    this.readyOrders = computed(() =>
      this.orders().filter(
        (o) =>
          o.items?.some((i) => i.status === 'Ready') &&
          !o.items?.some((i) => i.status === 'Sent' || i.status === 'Preparing'),
      ),
    );

    this.pendingMenuGroups = computed(() => this.buildMenuGroups('pending'));
    this.readyMenuGroups = computed(() => this.buildMenuGroups('ready'));

    this.totalSent = computed(() =>
      this.orders().reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.status === 'Sent').length,
        0,
      ),
    );

    this.totalPreparing = computed(() =>
      this.orders().reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.status === 'Preparing').length,
        0,
      ),
    );

    this.totalReady = computed(() =>
      this.orders().reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.status === 'Ready').length,
        0,
      ),
    );

    this.totalCancelled = computed(() =>
      this.orders().reduce(
        (sum, o) => sum + (o.items ?? []).filter((i) => i.status === 'Cancelled').length,
        0,
      ),
    );
  }

  ngOnInit(): void {
    this.kitchenState.connect(this.destroyRef);
    this.kitchenState.loadItems(this.categoryType);
  }

  ngOnDestroy(): void {
    this.kitchenState.disconnect();
  }

  // --- View Mode ---

  toggleViewMode(mode: 'order' | 'menu'): void {
    this.viewMode.set(mode);
    localStorage.setItem(LS_VIEW_MODE_KEY, mode);
  }

  // --- Order View helpers ---

  hasSentItems(order: KitchenOrderModel): boolean {
    return (order.items ?? []).some((i) => i.status === 'Sent');
  }

  hasPreparingItems(order: KitchenOrderModel): boolean {
    return (order.items ?? []).some((i) => i.status === 'Preparing');
  }

  getPendingItems(order: KitchenOrderModel): KitchenOrderItemModel[] {
    return (order.items ?? []).filter((i) => i.status === 'Sent' || i.status === 'Preparing');
  }

  getReadyItems(order: KitchenOrderModel): KitchenOrderItemModel[] {
    return (order.items ?? []).filter((i) => i.status === 'Ready');
  }

  getCancelledItems(order: KitchenOrderModel): KitchenOrderItemModel[] {
    return (order.items ?? []).filter((i) => i.status === 'Cancelled');
  }

  hasCancelledItems(order: KitchenOrderModel): boolean {
    return (order.items ?? []).some((i) => i.status === 'Cancelled');
  }

  startPreparing(item: KitchenOrderItemModel): void {
    if (!item.orderItemId) return;
    this.kitchenState.startPreparing([item.orderItemId], this.categoryType);
  }

  startPreparingAll(order: KitchenOrderModel): void {
    const ids = (order.items ?? [])
      .filter((i) => i.status === 'Sent')
      .map((i) => i.orderItemId!)
      .filter(Boolean);
    if (ids.length === 0) return;
    this.kitchenState.startPreparing(ids, this.categoryType);
  }

  markReady(item: KitchenOrderItemModel): void {
    if (!item.orderItemId) return;
    this.kitchenState.markReady([item.orderItemId], this.categoryType);
  }

  markReadyAll(order: KitchenOrderModel): void {
    const ids = (order.items ?? [])
      .filter((i) => i.status === 'Preparing')
      .map((i) => i.orderItemId!)
      .filter(Boolean);
    if (ids.length === 0) return;
    this.kitchenState.markReady(ids, this.categoryType);
  }

  // --- Menu View helpers ---

  hasSentGroupItems(group: MenuGroup): boolean {
    return group.items.some((i) => i.status === 'Sent');
  }

  hasPreparingGroupItems(group: MenuGroup): boolean {
    return group.items.some((i) => i.status === 'Preparing');
  }

  getSentCount(group: MenuGroup): number {
    return group.items.filter((i) => i.status === 'Sent').reduce((sum, i) => sum + i.quantity, 0);
  }

  getPreparingCount(group: MenuGroup): number {
    return group.items.filter((i) => i.status === 'Preparing').reduce((sum, i) => sum + i.quantity, 0);
  }

  getReadyCount(group: MenuGroup): number {
    return group.items.filter((i) => i.status === 'Ready').reduce((sum, i) => sum + i.quantity, 0);
  }

  startPreparingGroup(group: MenuGroup): void {
    const ids = group.items.filter((i) => i.status === 'Sent').map((i) => i.orderItemId);
    if (ids.length === 0) return;
    this.kitchenState.startPreparing(ids, this.categoryType);
  }

  markReadyGroup(group: MenuGroup): void {
    const ids = group.items.filter((i) => i.status === 'Preparing').map((i) => i.orderItemId);
    if (ids.length === 0) return;
    this.kitchenState.markReady(ids, this.categoryType);
  }

  startPreparingItem(item: MenuGroupItem): void {
    this.kitchenState.startPreparing([item.orderItemId], this.categoryType);
  }

  markReadyItem(item: MenuGroupItem): void {
    this.kitchenState.markReady([item.orderItemId], this.categoryType);
  }

  // --- Shared helpers ---

  getElapsedMinutes(dateStr: string | null | undefined): number {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  }

  getTimeBadgeClass(minutes: number): string {
    if (minutes >= 15) return 'bg-danger text-white';
    if (minutes >= 10) return 'bg-warning-dark text-white';
    return 'bg-surface-hover text-surface-sub';
  }

  // --- Private ---

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
        const aTime = a.sentToKitchenAt ? new Date(a.sentToKitchenAt).getTime() : 0;
        const bTime = b.sentToKitchenAt ? new Date(b.sentToKitchenAt).getTime() : 0;
        return aTime - bTime;
      });
    }

    return Array.from(groups.values()).sort((a, b) => {
      const aOldest = a.items[0]?.sentToKitchenAt ? new Date(a.items[0].sentToKitchenAt).getTime() : 0;
      const bOldest = b.items[0]?.sentToKitchenAt ? new Date(b.items[0].sentToKitchenAt).getTime() : 0;
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

interface ViewTab {
  mode: 'order' | 'menu';
  label: string;
  icon: string;
}
