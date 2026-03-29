import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { ZonesService } from '@app/core/api/services/zones.service';
import { FloorObjectsService } from '@app/core/api/services/floor-objects.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ZoneResponseModel } from '@app/core/api/models/zone-response-model';
import { FloorObjectResponseModel } from '@app/core/api/models/floor-object-response-model';
import { NotiStoreService } from '@app/core/services/noti-store.service';
import { OrderHubService } from '@app/core/services/order-hub.service';
import { TableActionDialogComponent } from '../../dialogs/table-action-dialog/table-action-dialog.component';

const CANVAS_REF_WIDTH = 1400;
const AUTO_GRID_GAP = 20;
const AUTO_GRID_START_X = 30;
const AUTO_GRID_START_Y = 30;

@Component({
  selector: 'app-order-overview',
  standalone: false,
  templateUrl: './order-overview.component.html',
  providers: [DialogService],
})
export class OrderOverviewComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  tables = signal<TableResponseModel[]>([]);
  zones = signal<ZoneResponseModel[]>([]);
  floorObjects = signal<FloorObjectResponseModel[]>([]);
  selectedZoneId = signal<number | null>(null);
  canvasScale = signal(1);

  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLDivElement>;

  selectedStatusFilter = signal<string | null>(null);

  readonly statusLegend: OverviewStatusLegendItem[] = [
    {
      key: 'Available',
      label: 'ว่าง',
      color: 'bg-surface-sub',
      activeClass: 'bg-surface-sub text-white',
      borderClass: 'border-surface-sub text-surface-sub',
    },
    {
      key: 'NotOrdered',
      label: 'ยังไม่สั่ง',
      color: 'bg-amber',
      activeClass: 'bg-amber text-white',
      borderClass: 'border-amber text-amber',
    },
    {
      key: 'WaitingServe',
      label: 'รอเสิร์ฟ',
      color: 'bg-primary',
      activeClass: 'bg-primary text-white',
      borderClass: 'border-primary text-primary',
    },
    {
      key: 'AllServed',
      label: 'เสิร์ฟครบ',
      color: 'bg-success-dark',
      activeClass: 'bg-success-dark text-white',
      borderClass: 'border-success-dark text-success-dark',
    },
    {
      key: 'Billing',
      label: 'เช็คบิล',
      color: 'bg-billing',
      activeClass: 'bg-billing text-white',
      borderClass: 'border-billing text-billing',
    },
    {
      key: 'Cleaning',
      label: 'เคลียร์โต๊ะ',
      color: 'bg-surface-sidebar',
      activeClass: 'bg-surface-sidebar text-white',
      borderClass: 'border-surface-sidebar text-surface-sub',
    },
    {
      key: 'Reserved',
      label: 'จองแล้ว',
      color: 'bg-info',
      activeClass: 'bg-info text-white',
      borderClass: 'border-info text-info',
    },
    {
      key: 'Unavailable',
      label: 'ปิดใช้งาน',
      color: 'bg-danger',
      activeClass: 'bg-danger text-white',
      borderClass: 'border-danger text-danger',
    },
  ];

  private resizeObserver?: ResizeObserver;

  filteredTables = computed(() => {
    const zoneId = this.selectedZoneId();
    const all = this.tables();
    return zoneId ? all.filter((t) => t.zoneId === zoneId) : all;
  });

  statusCounts = computed(() => {
    const tables = this.filteredTables();
    const counts: Record<string, number> = {
      Available: 0,
      NotOrdered: 0,
      WaitingServe: 0,
      AllServed: 0,
      Billing: 0,
      Cleaning: 0,
      Reserved: 0,
      Unavailable: 0,
    };
    for (const t of tables) {
      const group = this.getStatusGroup(t);
      counts[group] = (counts[group] ?? 0) + 1;
    }
    return counts;
  });

  activeZones = computed(() => {
    const zoneIdsWithTables = new Set(this.tables().map((t) => t.zoneId));
    return this.zones().filter((z) => zoneIdsWithTables.has(z.zoneId));
  });

  filteredFloorObjects = computed(() => {
    const zoneId = this.selectedZoneId();
    const all = this.floorObjects();
    return zoneId ? all.filter((o) => o.zoneId === zoneId) : all;
  });

  selectedZoneColor = computed(() => {
    const zoneId = this.selectedZoneId();
    if (!zoneId) return null;
    return this.zones().find((z) => z.zoneId === zoneId)?.color ?? null;
  });

  callingTableIds = computed(() => {
    const ids = new Set<number>();
    for (const n of this.notiStoreService.notifications()) {
      if (n.eventType === 'CALL_WAITER' && !n.isRead && n.tableId) {
        ids.add(n.tableId);
      }
    }
    return ids;
  });

  constructor(
    private readonly tablesService: TablesService,
    private readonly zonesService: ZonesService,
    private readonly floorObjectsService: FloorObjectsService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
    private readonly notiStoreService: NotiStoreService,
    private readonly orderHubService: OrderHubService,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadZones();
    this.loadTables();
    this.loadFloorObjects();
    this.connectSignalR();
  }

  ngAfterViewInit(): void {
    this.observeCanvasResize();
  }

  ngOnDestroy(): void {
    this.orderHubService.leaveGroup('floor');
    this.resizeObserver?.disconnect();
  }

  onSelectZone(zoneId: number | null): void {
    this.selectedZoneId.set(zoneId);
    this.selectedStatusFilter.set(null);
  }

  toggleStatusFilter(key: string): void {
    this.selectedStatusFilter.update((v) => (v === key ? null : key));
  }

  onTableClick(table: TableResponseModel): void {
    const ref = this.dialogService.open(TableActionDialogComponent, {
      header: `โซน${table.zoneName} - โต๊ะ${table.tableName}`,
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '40vw',
      data: { table },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadTables();
      });
  }

  onDismissCallWaiter(event: Event, table: TableResponseModel): void {
    event.stopPropagation();
    const noti = this.notiStoreService
      .notifications()
      .find(
        (n) =>
          n.eventType === 'CALL_WAITER' &&
          !n.isRead &&
          n.tableId === table.tableId,
      );
    if (noti?.notificationId) {
      this.notiStoreService.markRead(noti.notificationId);
    }
  }

  onQuickClean(event: Event, table: TableResponseModel): void {
    event.stopPropagation();
    this.tablesService
      .tablesCleanTablePost({ tableId: table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadTables() });
  }

  getTableClasses(table: TableResponseModel): string {
    const sizeShape = this.getSizeClass(table.size);
    const status = this.getStatusClasses(table);
    const dimmed = this.isTableDimmed(table) ? 'opacity-30' : '';
    return `${sizeShape} ${status} ${dimmed} relative cursor-pointer border-4 bg-surface-card flex flex-col items-center justify-center transition-all`;
  }

  isTableDimmed(table: TableResponseModel): boolean {
    const filter = this.selectedStatusFilter();
    if (!filter) return false;
    return this.getStatusGroup(table) !== filter;
  }

  getStatusGroup(table: TableResponseModel): string {
    switch (table.status) {
      case 'Available':
        return 'Available';
      case 'Occupied':
        if ((table.totalActiveItemCount ?? 0) === 0) return 'NotOrdered';
        if ((table.unservedItemCount ?? 0) > 0) return 'WaitingServe';
        return 'AllServed';
      case 'Billing':
        return 'Billing';
      case 'Cleaning':
        return 'Cleaning';
      case 'Reserved':
        return 'Reserved';
      case 'Unavailable':
        return 'Unavailable';
      default:
        return 'Available';
    }
  }

  getStatusLabel(table: TableResponseModel): string {
    switch (table.status) {
      case 'Available':
        return 'ว่าง';
      case 'Occupied':
        if ((table.totalActiveItemCount ?? 0) === 0) return 'ยังไม่สั่ง';
        if ((table.unservedItemCount ?? 0) > 0) return 'รอเสิร์ฟ';
        return 'เสิร์ฟครบ';
      case 'Billing':
        return 'เช็คบิล';
      case 'Reserved':
        return 'จองแล้ว';
      case 'Cleaning':
        return 'เคลียร์โต๊ะ';
      case 'Unavailable':
        return 'ปิดใช้งาน';
      default:
        return '-';
    }
  }

  getCapacityLabel(table: TableResponseModel): string {
    if (table.status === 'Occupied' && table.currentGuests) {
      return `${table.currentGuests}/${table.capacity}`;
    }
    return `${table.capacity}`;
  }

  getObjectIconName(objectType: string | null | undefined): string {
    switch (objectType) {
      case 'Restroom':
        return 'toilet';
      case 'Stairs':
        return 'stairs-handrail';
      case 'Counter':
        return 'counter-bar';
      case 'Kitchen':
        return 'kitchen-room';
      case 'Exit':
        return 'exit';
      case 'Cashier':
        return 'cashier-machine';
      case 'Plant':
        return 'tree';
      case 'Decoration':
        return 'furniture';
      default:
        return 'furniture';
    }
  }

  getObjectTypeClasses(objectType: string | null | undefined): string {
    switch (objectType) {
      case 'Restroom':
        return 'border-info text-info';
      case 'Stairs':
        return 'border-warning text-warning';
      case 'Counter':
        return 'border-primary text-primary';
      case 'Kitchen':
        return 'border-danger text-danger';
      case 'Exit':
        return 'border-success text-success';
      case 'Cashier':
        return 'border-info text-info';
      case 'Plant':
        return 'border-success text-success';
      case 'Decoration':
        return 'border-surface-sub text-surface-sub';
      default:
        return 'border-surface-sub text-surface-sub';
    }
  }

  private observeCanvasResize(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.ngZone.run(() => {
        const width = entries[0].contentRect.width;
        this.canvasScale.set(width / CANVAS_REF_WIDTH);
      });
    });
    this.resizeObserver.observe(this.canvasEl.nativeElement);
  }

  private connectSignalR(): void {
    this.orderHubService.start('floor');
    this.orderHubService.tableStatusChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
    this.orderHubService.newOrderItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
    this.orderHubService.itemStatusChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
    this.orderHubService.itemCancelled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
    this.orderHubService.orderUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
    this.orderHubService.paymentCompleted$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTables());
  }

  private loadTables(): void {
    this.tablesService
      .tablesGetTablesGet({ ItemPerPage: 999 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.results ?? [];
          this.assignAutoPositions(items);
          this.tables.set(items);
          this.autoSelectFirstActiveZone();
        },
      });
  }

  private loadZones(): void {
    this.zonesService
      .zonesGetActiveZonesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.zones.set(res.results ?? []);
          this.autoSelectFirstActiveZone();
        },
      });
  }

  private autoSelectFirstActiveZone(): void {
    const active = this.activeZones();
    const current = this.selectedZoneId();
    if (!current || !active.some((z) => z.zoneId === current)) {
      if (active.length > 0) {
        this.selectedZoneId.set(active[0].zoneId!);
      }
    }
  }

  private loadFloorObjects(): void {
    this.floorObjectsService
      .floorObjectsGetFloorObjectsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.floorObjects.set(res.results ?? []),
      });
  }

  private assignAutoPositions(tables: TableResponseModel[]): void {
    const sizeMap: Record<string, number> = {
      Small: 112,
      Medium: 144,
      Large: 224,
    };
    let x = AUTO_GRID_START_X;
    let y = AUTO_GRID_START_Y;
    let rowMaxH = 0;

    for (const t of tables) {
      if (t.positionX || t.positionY) continue;

      const w = sizeMap[t.size ?? 'Medium'] ?? 96;
      if (x + w > 1100) {
        x = AUTO_GRID_START_X;
        y += rowMaxH + AUTO_GRID_GAP;
        rowMaxH = 0;
      }

      t.positionX = x;
      t.positionY = y;
      x += w + AUTO_GRID_GAP;
      rowMaxH = Math.max(rowMaxH, w);
    }
  }

  private getSizeClass(size: string | null | undefined): string {
    switch (size) {
      case 'Small':
        return 'w-32 h-32 rounded-full';
      case 'Large':
        return 'w-64 h-32 rounded-lg';
      default:
        return 'w-40 h-40 rounded-lg';
    }
  }

  private getStatusClasses(table: TableResponseModel): string {
    switch (table.status) {
      case 'Available':
        return 'border-surface-sub';
      case 'Occupied':
        if ((table.totalActiveItemCount ?? 0) === 0) return 'border-amber';
        if ((table.unservedItemCount ?? 0) > 0) return 'border-primary';
        return 'border-success-dark';
      case 'Billing':
        return 'border-billing';
      case 'Reserved':
        return 'border-info';
      case 'Cleaning':
        return 'border-surface-sidebar';
      case 'Unavailable':
        return 'border-danger';
      default:
        return 'border-surface-border';
    }
  }
}

interface OverviewStatusLegendItem {
  key: string;
  label: string;
  color: string;
  activeClass: string;
  borderClass: string;
}
