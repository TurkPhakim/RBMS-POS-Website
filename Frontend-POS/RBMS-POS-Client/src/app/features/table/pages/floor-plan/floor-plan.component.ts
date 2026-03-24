import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
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
import { OrderHubService } from '@app/core/services/order-hub.service';
import { TableActionDialogComponent } from '../../dialogs/table-action-dialog/table-action-dialog.component';
import { FloorObjectDialogComponent } from '../../dialogs/floor-object-dialog/floor-object-dialog.component';

const AUTO_GRID_GAP = 20;
const AUTO_GRID_START_X = 30;
const AUTO_GRID_START_Y = 30;
const KEY_BTN_EDIT = 'edit-floor-plan';
const KEY_BTN_ADD_OBJECT = 'add-floor-object';

@Component({
  selector: 'app-floor-plan',
  standalone: false,
  templateUrl: './floor-plan.component.html',
  providers: [DialogService],
})
export class FloorPlanComponent implements OnInit, OnDestroy {
  tables = signal<TableResponseModel[]>([]);
  zones = signal<ZoneResponseModel[]>([]);
  floorObjects = signal<FloorObjectResponseModel[]>([]);
  selectedZoneId = signal<number | null>(null);
  isEditMode = signal(false);

  canUpdate: boolean;
  canCreateFloorObject: boolean;
  canUpdateFloorObject: boolean;

  private _wasDragged = false;

  filteredTables = computed(() => {
    const zoneId = this.selectedZoneId();
    const all = this.tables();
    return zoneId ? all.filter((t) => t.zoneId === zoneId) : all;
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
    private readonly orderHubService: OrderHubService,
  ) {
    this.canUpdate = this.authService.hasPermission('floor-plan.update');
    this.canCreateFloorObject = this.authService.hasPermission('floor-plan.create');
    this.canUpdateFloorObject = this.authService.hasPermission('floor-plan.update');
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadTables();
    this.loadFloorObjects();
    this.setupBreadcrumbButtons();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
    this.orderHubService.leaveGroup('floor');
  }

  onSelectZone(zoneId: number | null): void {
    this.selectedZoneId.set(zoneId);
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
    table.positionX = Math.max(0, Math.round(pos.x));
    table.positionY = Math.max(0, Math.round(pos.y));
  }

  onTableClick(table: TableResponseModel): void {
    if (this.isEditMode()) return;

    const ref = this.dialogService.open(TableActionDialogComponent, {
      header: `โต๊ะ ${table.tableName}`,
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

  getTableClasses(table: TableResponseModel): string {
    const sizeShape = this.getSizeClass(table.size);
    const status = this.getStatusClasses(table.status);
    const cursor = this.isEditMode() ? 'cursor-move' : 'cursor-pointer';
    return `${sizeShape} ${status} ${cursor} border-2 flex flex-col items-center justify-center transition-all`;
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Available': return 'ว่าง';
      case 'Occupied': return 'มีลูกค้า';
      case 'Billing': return 'เช็คบิล';
      case 'Reserved': return 'จองแล้ว';
      case 'Cleaning': return 'ทำความสะอาด';
      case 'Unavailable': return 'ปิดใช้งาน';
      default: return '-';
    }
  }

  getCapacityLabel(table: TableResponseModel): string {
    if (table.status === 'Occupied' && table.currentGuests) {
      return `${table.currentGuests}/${table.capacity}`;
    }
    return `${table.capacity}`;
  }

  getFreeDragPosition(table: TableResponseModel): { x: number; y: number } {
    return { x: table.positionX ?? 0, y: table.positionY ?? 0 };
  }

  onObjDragStarted(): void {
    this._wasDragged = true;
  }

  onObjDragEnded(event: CdkDragEnd, obj: FloorObjectResponseModel): void {
    const pos = event.source.getFreeDragPosition();
    obj.positionX = Math.max(0, Math.round(pos.x));
    obj.positionY = Math.max(0, Math.round(pos.y));
  }

  getObjFreeDragPosition(obj: FloorObjectResponseModel): { x: number; y: number } {
    return { x: obj.positionX ?? 0, y: obj.positionY ?? 0 };
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
      styleClass: 'card-dialog',
      width: '35vw',
      data: { floorObject: obj },
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
      styleClass: 'card-dialog',
      width: '35vw',
      data: { zoneId: this.selectedZoneId() },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadFloorObjects();
      });
  }

  getObjectIconName(objectType: string | null | undefined): string {
    switch (objectType) {
      case 'Restroom': return 'floor-restroom';
      case 'Stairs': return 'floor-stairs';
      case 'Counter': return 'floor-counter';
      case 'Kitchen': return 'chef';
      case 'Exit': return 'floor-exit';
      case 'Cashier': return 'floor-cashier';
      case 'Decoration': return 'floor-decoration';
      default: return 'floor-decoration';
    }
  }

  getObjectTypeClasses(objectType: string | null | undefined): string {
    switch (objectType) {
      case 'Restroom': return 'border-info text-info';
      case 'Stairs': return 'border-warning text-warning';
      case 'Counter': return 'border-primary text-primary';
      case 'Kitchen': return 'border-danger text-danger';
      case 'Exit': return 'border-success text-success';
      case 'Cashier': return 'border-info text-info';
      case 'Decoration': return 'border-surface-sub text-surface-sub';
      default: return 'border-surface-sub text-surface-sub';
    }
  }

  private setupBreadcrumbButtons(): void {
    if (!this.canUpdate) return;
    this.updateEditButton();
  }

  private updateEditButton(): void {
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
    } else {
      this.breadcrumbService.removeButton(KEY_BTN_ADD_OBJECT);
    }

    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_EDIT,
      type: 'button',
      item: {
        key: KEY_BTN_EDIT,
        label: this.isEditMode() ? 'บันทึกตำแหน่ง' : 'จัดผังโต๊ะ',
        severity: this.isEditMode() ? 'primary' : 'secondary',
        variant: this.isEditMode() ? undefined : 'outlined',
        callback: () => this.toggleEditMode(),
      },
    });
  }

  private connectSignalR(): void {
    this.orderHubService.start('floor');
    this.orderHubService.tableStatusChanged$
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
        },
      });
  }

  private loadZones(): void {
    this.zonesService
      .zonesGetActiveZonesGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.results ?? [];
          this.zones.set(items);
          if (items.length > 0 && this.selectedZoneId() === null) {
            this.selectedZoneId.set(items[0].zoneId!);
          }
        },
      });
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
    const sizeMap: Record<string, number> = { Small: 128, Medium: 176, Large: 288 };
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
      case 'Small': return 'w-32 h-32 rounded-full';
      case 'Large': return 'w-72 h-36 rounded-lg';
      default: return 'w-44 h-44 rounded-lg';
    }
  }

  private getStatusClasses(status: string | null | undefined): string {
    switch (status) {
      case 'Available': return 'border-success bg-success/10';
      case 'Occupied': return 'border-primary bg-primary/10';
      case 'Billing': return 'border-warning bg-warning/10';
      case 'Reserved': return 'border-info bg-info/10';
      case 'Cleaning': return 'border-surface-sub bg-surface';
      case 'Unavailable': return 'border-danger bg-danger/10';
      default: return 'border-surface-border bg-surface';
    }
  }
}
