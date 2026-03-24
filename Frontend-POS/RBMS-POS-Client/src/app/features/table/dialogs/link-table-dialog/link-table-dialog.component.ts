import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-link-table-dialog',
  standalone: false,
  templateUrl: './link-table-dialog.component.html',
})
export class LinkTableDialogComponent implements OnInit {
  table: TableResponseModel;
  headerLabel: string;
  linkableTables = signal<LinkableTable[]>([]);
  isSubmitting = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly tablesService: TablesService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.table = this.config.data.table;
    this.headerLabel = this.config.header!;
  }

  ngOnInit(): void {
    this.loadOccupiedTables();
  }

  get hasSelection(): boolean {
    return this.linkableTables().some((t) => t.selected);
  }

  onToggle(table: LinkableTable): void {
    this.linkableTables.update((list) =>
      list.map((t) =>
        t.tableId === table.tableId ? { ...t, selected: !t.selected } : t,
      ),
    );
  }

  onSubmit(): void {
    const selectedIds = this.linkableTables()
      .filter((t) => t.selected)
      .map((t) => t.tableId);

    if (selectedIds.length === 0) return;

    this.isSubmitting.set(true);

    this.tablesService
      .tablesLinkTablesPost({
        body: { tableIds: [this.table.tableId!, ...selectedIds] },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถเชื่อมโต๊ะได้',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }

  private loadOccupiedTables(): void {
    this.tablesService
      .tablesGetTablesGet({ status: 'Occupied', ItemPerPage: 999 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.linkableTables.set(
            (res.results ?? [])
              .filter(
                (t) =>
                  t.tableId !== this.table.tableId && !t.linkedGroupCode,
              )
              .map((t) => ({
                tableId: t.tableId!,
                tableName: t.tableName ?? '',
                zoneName: t.zoneName ?? '',
                capacity: t.capacity ?? 0,
                currentGuests: t.currentGuests ?? null,
                selected: false,
              })),
          );
        },
      });
  }
}

interface LinkableTable {
  tableId: number;
  tableName: string;
  zoneName: string;
  capacity: number;
  currentGuests: number | null;
  selected: boolean;
}
