import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { ReservationResponseModel } from '@app/core/api/models/reservation-response-model';
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
  form: FormGroup;
  isSubmitting = signal(false);
  private selectedReservation: ReservationResponseModel | null = null;

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
    this.form = fb.group({
      guestCount: [1, [Validators.required, Validators.min(1)]],
      guestType: ['WalkIn', Validators.required],
      reservationId: [null as number | null],
      note: [''],
    });

    this.form.controls['guestType'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        const ctrl = this.form.controls['reservationId'];
        if (type === 'Reserved') {
          ctrl.setValidators([Validators.required]);
        } else {
          ctrl.clearValidators();
          ctrl.setValue(null);
          this.selectedReservation = null;
        }
        ctrl.updateValueAndValidity();
      });
  }

  onReservationSelected(reservation: ReservationResponseModel | null): void {
    this.selectedReservation = reservation;
    if (reservation?.guestCount) {
      this.form.controls['guestCount'].setValue(reservation.guestCount);
    }
  }

  onSubmit(): void {
    markFormDirty(this.form);
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const val = this.form.getRawValue();

    // รวม note: "จอง: {ชื่อ} ({เบอร์}) - {note การจอง} - {note เปิดโต๊ะ}"
    let finalNote = val.note || '';
    if (this.selectedReservation) {
      const r = this.selectedReservation;
      const parts = [`จอง: ${r.customerName ?? ''}`];
      if (r.customerPhone) parts[0] += ` (${r.customerPhone})`;
      if (r.note) parts.push(r.note);
      if (val.note) parts.push(val.note);
      finalNote = parts.join(' - ');
    }

    this.tablesService
      .tablesOpenTablePost({
        tableId: this.table.tableId!,
        body: {
          guestCount: val.guestCount,
          guestType: val.guestType,
          note: finalNote || undefined,
          reservationId: val.reservationId && val.reservationId > 0 ? val.reservationId : undefined,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
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
