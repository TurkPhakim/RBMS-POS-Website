import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';
import { QrCodeDialogComponent } from '../qr-code-dialog/qr-code-dialog.component';

@Component({
  selector: 'app-open-table-dialog',
  standalone: false,
  templateUrl: './open-table-dialog.component.html',
  providers: [DialogService],
})
export class OpenTableDialogComponent {
  table: TableResponseModel;
  headerLabel: string;
  form: FormGroup;
  isSubmitting = signal(false);

  readonly guestTypeOptions: GuestTypeOption[] = [
    { label: 'Walk-in', value: 'WalkIn' },
    { label: 'จองล่วงหน้า', value: 'Reserved' },
  ];

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly tablesService: TablesService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
    fb: FormBuilder,
  ) {
    this.table = this.config.data.table;
    this.headerLabel = this.config.header!;
    this.form = fb.group({
      guestCount: [1, [Validators.required, Validators.min(1)]],
      guestType: ['WalkIn', Validators.required],
      note: [''],
    });
  }

  onSubmit(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const val = this.form.getRawValue();

    this.tablesService
      .tablesOpenTablePost({
        tableId: this.table.tableId!,
        body: {
          guestCount: val.guestCount,
          guestType: val.guestType,
          note: val.note || undefined,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Fetch QR token then show QR dialog
          this.tablesService
            .tablesGetQrTokenGet({ tableId: this.table.tableId! })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                this.isSubmitting.set(false);
                const qrToken = res.result;
                if (qrToken) {
                  this.showQrDialog(qrToken);
                } else {
                  this.ref.close(true);
                }
              },
              error: () => {
                // QR fetch failed, still close as success (table was opened)
                this.ref.close(true);
              },
            });
        },
        error: () => {
          this.isSubmitting.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถเปิดโต๊ะได้',
          });
        },
      });
  }

  onCancel(): void {
    this.ref.close();
  }

  private showQrDialog(qrToken: string): void {
    const qrRef = this.dialogService.open(QrCodeDialogComponent, {
      header: `QR Code — ${this.table.tableName}`,
      data: {
        table: this.table,
        qrToken,
      },
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
      modal: true,
    });

    qrRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.ref.close(true);
      });
  }
}

interface GuestTypeOption {
  label: string;
  value: string;
}
