import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-move-table-dialog',
  standalone: false,
  templateUrl: './move-table-dialog.component.html',
})
export class MoveTableDialogComponent {
  table: TableResponseModel;
  headerLabel: string;
  selectedTableId = signal<number | null>(null);
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

  onSubmit(): void {
    if (!this.selectedTableId()) return;
    this.isSubmitting.set(true);

    this.tablesService
      .tablesMoveTablePost({
        tableId: this.table.tableId!,
        body: { targetTableId: this.selectedTableId()! },
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
            message: 'ไม่สามารถย้ายโต๊ะได้',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }
}
