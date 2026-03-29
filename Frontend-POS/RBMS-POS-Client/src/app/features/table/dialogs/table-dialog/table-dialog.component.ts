import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-table-dialog',
  standalone: false,
  templateUrl: './table-dialog.component.html',
})
export class TableDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);

  private tableId: number | null = null;
  table: TableResponseModel | null = null;
  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('table-manage.update');
  }

  ngOnInit(): void {
    this.tableId = this.config.data?.tableId ?? null;
    this.isEditMode.set(!!this.tableId);
    this.initForm();

    if (this.tableId) {
      this.loadTable(this.tableId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      this.updateTable();
    } else {
      this.createTable();
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Available': return 'ว่าง';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning': return 'มีลูกค้า';
      case 'Reserved': return 'ติดจอง';
      case 'Unavailable': return 'ปิดใช้งาน';
      default: return '-';
    }
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    switch (status) {
      case 'Available': return 'success';
      case 'Occupied':
      case 'Billing':
      case 'Cleaning': return 'warn';
      case 'Reserved': return 'info';
      case 'Unavailable': return 'danger';
      default: return 'secondary';
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private initForm(): void {
    this.form = this.fb.group({
      tableName: ['', [Validators.required, Validators.maxLength(50)]],
      zoneId: [null, Validators.required],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(50)]],
      size: ['Medium', Validators.required],
    });
  }

  private loadTable(id: number): void {
    this.tablesService
      .tablesGetTableGet({ tableId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.table = res.result ?? null;
          if (this.table) {
            this.form.patchValue({
              tableName: this.table.tableName,
              zoneId: this.table.zoneId,
              capacity: this.table.capacity,
              size: this.table.size,
            });
            if (!this.canUpdate) this.form.disable();
          }
        },
      });
  }

  private createTable(): void {
    const val = this.form.value;
    this.tablesService
      .tablesCreateTablePost({
        body: {
          tableName: val.tableName,
          zoneId: val.zoneId,
          capacity: val.capacity,
          size: val.size,
        },
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
            message: 'ไม่สามารถสร้างโต๊ะได้',
          });
        },
      });
  }

  private updateTable(): void {
    const val = this.form.value;
    this.tablesService
      .tablesUpdateTablePut({
        tableId: this.tableId!,
        body: {
          tableName: val.tableName,
          zoneId: val.zoneId,
          capacity: val.capacity,
          size: val.size,
        },
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
            message: 'ไม่สามารถบันทึกข้อมูลได้',
          });
        },
      });
  }
}
