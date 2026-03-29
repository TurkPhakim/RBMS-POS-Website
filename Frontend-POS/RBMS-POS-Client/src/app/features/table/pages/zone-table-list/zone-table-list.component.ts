import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ZonesService } from '@app/core/api/services/zones.service';
import { TablesService } from '@app/core/api/services/tables.service';
import { ZoneResponseModel } from '@app/core/api/models/zone-response-model';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { ZoneDialogComponent } from '../../dialogs/zone-dialog/zone-dialog.component';
import { TableDialogComponent } from '../../dialogs/table-dialog/table-dialog.component';

const KEY_BTN_ADD = 'add-zone-table';

const STATUS_OPTIONS = [
  { value: null, label: 'ทั้งหมด' },
  { value: 'Available', label: 'ว่าง' },
  { value: 'Occupied', label: 'มีลูกค้า' },
  { value: 'Reserved', label: 'ติดจอง' },
  { value: 'Unavailable', label: 'ปิดใช้งาน' },
];

@Component({
  selector: 'app-zone-table-list',
  standalone: false,
  templateUrl: './zone-table-list.component.html',
  providers: [DialogService],
})
export class ZoneTableListComponent implements OnInit, OnDestroy {
  // Zone signals
  zones = signal<ZoneResponseModel[]>([]);
  zoneSearchTerm = signal('');

  // Table signals
  tables = signal<TableResponseModel[]>([]);
  totalRecords = signal(0);
  tableSearchTerm = signal('');
  selectedZoneId = signal<number | null>(null);
  selectedStatus = signal<string | null>(null);
  tablePage = signal(1);
  tableRows = signal(10);

  // Tab control
  activeTab = signal<'zone' | 'table'>('zone');

  // Permissions (zones merged into table-manage)
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly zonesService: ZonesService,
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = this.authService.hasPermission('table-manage.create');
    this.canUpdate = this.authService.hasPermission('table-manage.update');
    this.canDelete = this.authService.hasPermission('table-manage.delete');
  }

  ngOnInit(): void {
    // Check query param for tab
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'table') {
      this.activeTab.set('table');
    }

    this.loadActiveTabData();
    this.setupBreadcrumbButton();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onTabChange(tab: 'zone' | 'table'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.loadActiveTabData();
    this.setupBreadcrumbButton();
  }

  // ─── Zone methods ───

  onZoneSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.zoneSearchTerm.set(value);
    this.loadZones();
  }

  clearZoneSearch(input: HTMLInputElement): void {
    input.value = '';
    this.zoneSearchTerm.set('');
    this.loadZones();
  }

  openZoneDialog(zoneId: number | null): void {
    const ref = this.dialogService.open(ZoneDialogComponent, {
      header: zoneId ? 'แก้ไขโซน' : 'เพิ่มโซน',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '45vw',
      data: { zoneId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadZones();
      });
  }

  onDeleteZone(zoneId: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบโซน "${name}" หรือไม่?`,
      onConfirm: () => {
        this.zonesService
          .zonesDeleteZoneDelete({ zoneId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadZones();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถลบโซนได้\nเนื่องจากยังมีโต๊ะอยู่ในโซนนี้',
              }),
          });
      },
    });
  }

  onRowReorder(): void {
    const items = this.zones();
    const sortItems = items.map((item, index) => ({
      id: item.zoneId,
      sortOrder: index,
    }));

    this.zonesService
      .zonesUpdateSortOrderPut({ body: { items: sortItems } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถบันทึกลำดับได้',
          });
          this.loadZones();
        },
      });
  }

  // ─── Table methods ───

  onTableSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tableSearchTerm.set(value);
    this.tablePage.set(1);
    this.loadTables();
  }

  clearTableSearch(input: HTMLInputElement): void {
    input.value = '';
    this.tableSearchTerm.set('');
    this.tablePage.set(1);
    this.loadTables();
  }

  onZoneFilterChange(value: number | null): void {
    this.selectedZoneId.set(value);
    this.tablePage.set(1);
    this.loadTables();
  }

  onStatusChange(value: string | null): void {
    this.selectedStatus.set(value);
    this.tablePage.set(1);
    this.loadTables();
  }

  onTablePageChange(event: { first: number; rows: number }): void {
    this.tablePage.set(Math.floor(event.first / event.rows) + 1);
    this.tableRows.set(event.rows);
    this.loadTables();
  }

  onEditTable(tableId: number): void {
    this.openTableDialog(tableId);
  }

  onDeleteTable(tableId: number, name: string): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบโต๊ะ "${name}" หรือไม่?`,
      onConfirm: () => {
        this.tablesService
          .tablesDeleteTableDelete({ tableId })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadTables();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถลบโต๊ะได้',
              }),
          });
      },
    });
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

  getStatusColor(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'text-success';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning':
        return 'text-primary';
      case 'Reserved':
        return 'text-info';
      case 'Unavailable':
        return 'text-danger';
      default:
        return '';
    }
  }

  openTableDialog(tableId: number | null): void {
    const ref = this.dialogService.open(TableDialogComponent, {
      header: tableId ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะ',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog card-dialog--visible',
      width: '40vw',
      data: { tableId },
    });

    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reload: boolean | undefined) => {
        if (reload) this.loadTables();
      });
  }

  // ─── Private ───

  private loadActiveTabData(): void {
    if (this.activeTab() === 'zone') {
      this.loadZones();
    } else {
      this.loadTables();
    }
  }

  private loadZones(): void {
    this.zonesService
      .zonesGetZonesGet({
        ItemPerPage: 100,
        Search: this.zoneSearchTerm() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.zones.set(res.results ?? []),
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          }),
      });
  }

  private loadTables(): void {
    this.tablesService
      .tablesGetTablesGet({
        zoneId: this.selectedZoneId() ?? undefined,
        status: this.selectedStatus() ?? undefined,
        Page: this.tablePage(),
        ItemPerPage: this.tableRows(),
        Search: this.tableSearchTerm() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.tables.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          }),
      });
  }

  private setupBreadcrumbButton(): void {
    if (!this.canCreate) {
      this.breadcrumbService.removeButton(KEY_BTN_ADD);
      return;
    }

    const isZoneTab = this.activeTab() === 'zone';
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: isZoneTab ? 'เพิ่มโซน' : 'เพิ่มโต๊ะ',
        severity: 'primary',
        callback: () =>
          isZoneTab ? this.openZoneDialog(null) : this.openTableDialog(null),
      },
    });
  }
}
