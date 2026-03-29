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
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { DialogService } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { ZonesService } from '@app/core/api/services/zones.service';
import { FloorObjectsService } from '@app/core/api/services/floor-objects.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ZoneResponseModel } from '@app/core/api/models/zone-response-model';
import { FloorObjectResponseModel } from '@app/core/api/models/floor-object-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { FloorObjectDialogComponent } from '../../dialogs/floor-object-dialog/floor-object-dialog.component';

const AUTO_GRID_GAP = 20;
const AUTO_GRID_START_X = 30;
const AUTO_GRID_START_Y = 30;
const KEY_BTN_EDIT = 'edit-floor-plan';
const KEY_BTN_ADD_OBJECT = 'add-floor-object';
const CANVAS_REF_WIDTH = 1400;

@Component({
  selector: 'app-floor-plan',
  standalone: false,
  templateUrl: './floor-plan.component.html',
  providers: [DialogService],
})
export class FloorPlanComponent implements OnInit, AfterViewInit, OnDestroy {
  tables = signal<TableResponseModel[]>([]);
  zones = signal<ZoneResponseModel[]>([]);
  floorObjects = signal<FloorObjectResponseModel[]>([]);
  selectedZoneId = signal<number | null>(null);
  isEditMode = signal(false);
  canvasScale = signal(1);

  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLDivElement>;

  selectedStatusFilter = signal<string | null>(null);

  canUpdate: boolean;
  canCreateFloorObject: boolean;
  canUpdateFloorObject: boolean;

  private _wasDragged = false;
  private resizeObserver?: ResizeObserver;

  readonly statusLegend: StatusLegendItem[] = [
    {
      key: 'Available',
      label: 'ว่าง',
      color: 'bg-surface-sub',
      activeClass: 'bg-surface-sub text-white',
      borderClass: 'border-surface-sub text-surface-sub',
    },
    {
      key: 'Occupied',
      label: 'มีลูกค้า',
      color: 'bg-primary-badge',
      activeClass: 'bg-primary-badge text-white',
      borderClass: 'border-primary-badge text-primary',
    },
    {
      key: 'Reserved',
      label: 'ติดจอง',
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

  filteredTables = computed(() => {
    const zoneId = this.selectedZoneId();
    const all = this.tables();
    return zoneId ? all.filter((t) => t.zoneId === zoneId) : all;
  });

  statusCounts = computed(() => {
    const tables = this.filteredTables();
    const counts: Record<string, number> = {
      Available: 0,
      Occupied: 0,
      Reserved: 0,
      Unavailable: 0,
    };
    for (const t of tables) {
      const group = this.getStatusGroup(t.status);
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

  constructor(
    private readonly tablesService: TablesService,
    private readonly zonesService: ZonesService,
    private readonly floorObjectsService: FloorObjectsService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
    private readonly ngZone: NgZone,
  ) {
    this.canUpdate = this.authService.hasPermission('floor-plan.update');
    this.canCreateFloorObject =
      this.authService.hasPermission('floor-plan.create');
    this.canUpdateFloorObject =
      this.authService.hasPermission('floor-plan.update');
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadTables();
    this.loadFloorObjects();
    this.setupBreadcrumbButtons();
  }

  ngAfterViewInit(): void {
    this.observeCanvasResize();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
    this.resizeObserver?.disconnect();
  }

  onSelectZone(zoneId: number | null): void {
    this.selectedZoneId.set(zoneId);
    this.selectedStatusFilter.set(null);
  }

  toggleStatusFilter(key: string): void {
    this.selectedStatusFilter.update((v) => (v === key ? null : key));
  }

  isTableDimmed(table: TableResponseModel): boolean {
    const filter = this.selectedStatusFilter();
    if (!filter) return false;
    return this.getStatusGroup(table.status) !== filter;
  }

  toggleEditMode(): void {
    if (this.isEditMode()) {
      this.onSavePositions();
    }
    this.isEditMode.update((v) => !v);
    this.updateEditButton();
  }

  onDragEnded(event: CdkDragEnd, table: TableResponseModel): void {
    const pos = event.source.getFreeDragPosition();
    const s = this.canvasScale();
    table.positionX = Math.max(0, Math.round(pos.x / s));
    table.positionY = Math.max(0, Math.round(pos.y / s));
  }

  getTableClasses(table: TableResponseModel): string {
    const sizeShape = this.getSizeClass(table.size);
    const status = this.getStatusClasses(table.status);
    const cursor = this.isEditMode() ? 'cursor-move' : 'cursor-default';
    const dimmed = this.isTableDimmed(table) ? 'opacity-40' : '';
    return `${sizeShape} ${status} ${cursor} ${dimmed} border-4 bg-surface-card flex flex-col items-center justify-center transition-all`;
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'ว่าง';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning':
        return 'มีลูกค้า';
      case 'Reserved':
        return 'ติดจอง';
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

  getFreeDragPosition(table: TableResponseModel): { x: number; y: number } {
    const s = this.canvasScale();
    return { x: (table.positionX ?? 0) * s, y: (table.positionY ?? 0) * s };
  }

  onObjDragStarted(): void {
    this._wasDragged = true;
  }

  onObjDragEnded(event: CdkDragEnd, obj: FloorObjectResponseModel): void {
    const pos = event.source.getFreeDragPosition();
    const s = this.canvasScale();
    obj.positionX = Math.max(0, Math.round(pos.x / s));
    obj.positionY = Math.max(0, Math.round(pos.y / s));
  }

  getObjFreeDragPosition(obj: FloorObjectResponseModel): {
    x: number;
    y: number;
  } {
    const s = this.canvasScale();
    return { x: (obj.positionX ?? 0) * s, y: (obj.positionY ?? 0) * s };
  }

  onFloorObjectClick(obj: FloorObjectResponseModel): void {
    if (this._wasDragged) {
      this._wasDragged = false;
      return;
    }
    if (!this.isEditMode() || !this.canUpdateFloorObject) return;

    const ref = this.dialogService.open(FloorObjectDialogComponent, {
      header: 'แก้ไขวัตถุ',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog card-dialog--visible',
      width: '45vw',
      data: { floorObjectId: obj.floorObjectId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadFloorObjects();
      });
  }

  openAddFloorObjectDialog(): void {
    const ref = this.dialogService.open(FloorObjectDialogComponent, {
      header: 'เพิ่มวัตถุ',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog card-dialog--visible',
      width: '45vw',
      data: { zoneId: this.selectedZoneId() },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadFloorObjects();
      });
  }

  onDeleteFloorObject(event: Event, obj: FloorObjectResponseModel): void {
    event.stopPropagation();
    this.floorObjectsService
      .floorObjectsDeleteFloorObjectDelete({
        floorObjectId: obj.floorObjectId!,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadFloorObjects(),
      });
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

  private setupBreadcrumbButtons(): void {
    if (!this.canUpdate) return;
    this.updateEditButton();
  }

  private updateEditButton(): void {
    this.breadcrumbService.clearButtons();

    if (this.isEditMode() && this.canCreateFloorObject) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_ADD_OBJECT,
        type: 'button',
        item: {
          key: KEY_BTN_ADD_OBJECT,
          label: 'เพิ่มวัตถุ',
          severity: 'secondary',
          variant: 'outlined',
          callback: () => this.openAddFloorObjectDialog(),
        },
      });
    }

    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_EDIT,
      type: 'button',
      item: {
        key: KEY_BTN_EDIT,
        label: this.isEditMode() ? 'บันทึกตำแหน่ง' : 'จัดผังร้าน',
        severity: 'primary',
        variant: undefined,
        callback: () => this.toggleEditMode(),
      },
    });
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

  private onSavePositions(): void {
    const tableItems = this.tables().map((t) => ({
      tableId: t.tableId,
      positionX: t.positionX,
      positionY: t.positionY,
    }));
    this.tablesService
      .tablesUpdatePositionsPut({ body: { items: tableItems } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.modalService.commonSuccess(),
      });

    const objItems = this.floorObjects().map((o) => ({
      floorObjectId: o.floorObjectId,
      positionX: o.positionX,
      positionY: o.positionY,
    }));
    if (objItems.length > 0) {
      this.floorObjectsService
        .floorObjectsUpdatePositionsPut({ body: { items: objItems } })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
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

  private getStatusClasses(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'border-surface-sub';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning':
        return 'border-primary-badge';
      case 'Reserved':
        return 'border-info';
      case 'Unavailable':
        return 'border-danger';
      default:
        return 'border-surface-border';
    }
  }

  private getStatusGroup(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'Available';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning':
        return 'Occupied';
      case 'Reserved':
        return 'Reserved';
      case 'Unavailable':
        return 'Unavailable';
      default:
        return 'Available';
    }
  }
}

interface StatusLegendItem {
  key: string;
  label: string;
  color: string;
  activeClass: string;
  borderClass: string;
}
