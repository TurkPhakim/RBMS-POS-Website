import { Component, signal } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservationResponseModel } from '@app/core/api/models/reservation-response-model';

@Component({
  selector: 'app-confirm-reservation-dialog',
  standalone: false,
  templateUrl: './confirm-reservation-dialog.component.html',
})
export class ConfirmReservationDialogComponent {
  reservation!: ReservationResponseModel;
  headerLabel: string;
  selectedTableId = signal<number | null>(null);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
  ) {
    this.reservation = this.config.data.reservation;
    this.headerLabel = this.config.header!;
  }

  onConfirm(): void {
    if (!this.selectedTableId()) return;
    this.ref.close(this.selectedTableId());
  }

  onCancel(): void {
    this.ref.close();
  }
}
