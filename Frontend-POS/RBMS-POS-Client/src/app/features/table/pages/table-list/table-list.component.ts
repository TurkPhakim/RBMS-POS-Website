import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';

const KEY_BTN_ADD = 'add-table';

const STATUS_OPTIONS = [
  { value: null, label: 'ทั้งหมด' },
  { value: 'Available', label: 'ว่าง' },
  { value: 'Occupied', label: 'มีลูกค้า' },
  { value: 'Billing', label: 'เช็คบิล' },
  { value: 'Reserved', label: 'จองแล้ว' },
  { value: 'Cleaning', label: 'ทำความสะอาด' },
  { value: 'Unavailable', label: 'ปิดใช้งาน' },
];

@Component({
  selector: 'app-table-list',
  standalone: false,
  templateUrl: './table-list.component.html',
})
export class TableListComponent implements OnInit, OnDestroy {
  tables = signal<TableResponseModel[]>([]);
  totalRecords = signal(0);

  searchTerm = '';
  selectedZoneId: number | null = null;
  selectedStatus: string | null = null;
  page = 1;
  rows = 10;

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  constructor(
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = this.authService.hasPermission('table-manage.create');
    this.canUpdate = this.authService.hasPermission('table-manage.update');
    this.canDelete = this.authService.hasPermission('table-manage.delete');
  }

  ngOnInit(): void {
    this.loadTables();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadTables();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.rows = event.rows;
    this.loadTables();
  }

  onEdit(tableId: number): void {
    this.router.navigate(['/table/tables/update', tableId]);
  }

  onDelete(tableId: number, name: string): void {
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
    return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status ?? '-';
  }

  getStatusColor(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'text-success';
      case 'Occupied':
        return 'text-primary';
      case 'Billing':
        return 'text-warning';
      case 'Reserved':
        return 'text-info';
      case 'Cleaning':
        return 'text-surface-sub';
      case 'Unavailable':
        return 'text-danger';
      default:
        return '';
    }
  }

  private loadTables(): void {
    this.tablesService
      .tablesGetTablesGet({
        zoneId: this.selectedZoneId ?? undefined,
        status: this.selectedStatus ?? undefined,
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
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

  private setupBreadcrumbButtons(): void {
    if (!this.canCreate) return;
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่มโต๊ะ',
        severity: 'primary',
        callback: () => this.router.navigate(['/table/tables/create']),
      },
    });
  }
}
