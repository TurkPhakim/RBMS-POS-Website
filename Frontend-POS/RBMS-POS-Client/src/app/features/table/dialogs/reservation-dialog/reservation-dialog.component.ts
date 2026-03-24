import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservationsService } from '@app/core/api/services/reservations.service';
import { ReservationResponseModel } from '@app/core/api/models/reservation-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { markFormDirty } from '@app/shared/utils';

@Component({
  selector: 'app-reservation-dialog',
  standalone: false,
  templateUrl: './reservation-dialog.component.html',
})
export class ReservationDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  minDate = new Date();

  reservation: ReservationResponseModel | null = null;
  canUpdate: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly reservationsService: ReservationsService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canUpdate = this.authService.hasPermission('reservation.update');
  }

  ngOnInit(): void {
    this.reservation = this.config.data?.reservation ?? null;
    this.isEditMode.set(!!this.reservation);
    this.initForm();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markFormDirty(this.form);
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      this.updateReservation();
    } else {
      this.createReservation();
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }

  private initForm(): void {
    let dateTime: Date | null = null;
    if (this.reservation?.reservationDate) {
      dateTime = new Date(this.reservation.reservationDate);
      if (this.reservation.reservationTime) {
        const [h, m] = this.reservation.reservationTime.split(':').map(Number);
        dateTime.setHours(h, m, 0, 0);
      }
    }

    this.form = this.fb.group({
      customerName: [this.reservation?.customerName ?? '', [Validators.required, Validators.maxLength(100)]],
      customerPhone: [this.reservation?.customerPhone ?? '', [Validators.required, Validators.maxLength(20)]],
      reservationDateTime: [dateTime, Validators.required],
      guestCount: [this.reservation?.guestCount ?? 2, [Validators.required, Validators.min(1), Validators.max(50)]],
      tableId: [this.reservation?.tableId ?? null],
      note: [this.reservation?.note ?? ''],
    });

    if (this.isEditMode() && !this.canUpdate) {
      this.form.disable();
    }
  }

  private createReservation(): void {
    const val = this.form.value;
    const dt: Date = val.reservationDateTime;
    this.reservationsService
      .reservationsCreateReservationPost({
        body: {
          customerName: val.customerName,
          customerPhone: val.customerPhone,
          reservationDate: this.formatDate(dt),
          reservationTime: this.formatTimeFromDate(dt),
          guestCount: val.guestCount,
          tableId: val.tableId || null,
          note: val.note || null,
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
            message: 'ไม่สามารถสร้างการจองได้',
          });
        },
      });
  }

  private updateReservation(): void {
    const val = this.form.value;
    const dt: Date = val.reservationDateTime;
    this.reservationsService
      .reservationsUpdateReservationPut({
        reservationId: this.reservation!.reservationId!,
        body: {
          customerName: val.customerName,
          customerPhone: val.customerPhone,
          reservationDate: this.formatDate(dt),
          reservationTime: this.formatTimeFromDate(dt),
          guestCount: val.guestCount,
          tableId: val.tableId || null,
          note: val.note || null,
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

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatTimeFromDate(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}:00`;
  }
}
