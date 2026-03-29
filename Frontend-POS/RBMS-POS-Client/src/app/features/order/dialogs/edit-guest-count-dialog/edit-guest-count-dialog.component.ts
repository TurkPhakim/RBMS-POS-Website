import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrdersService } from '@app/core/api/services/orders.service';
import { ModalService } from '@app/core/services/modal.service';

@Component({
  selector: 'app-edit-guest-count-dialog',
  standalone: false,
  templateUrl: './edit-guest-count-dialog.component.html',
})
export class EditGuestCountDialogComponent {
  guestCount = signal(1);
  isSaving = signal(false);
  currentGuests: number;

  private orderId: number;

  constructor(
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private ordersService: OrdersService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {
    this.orderId = this.config.data.orderId;
    this.currentGuests = this.config.data.currentGuests ?? 1;
    this.guestCount.set(this.currentGuests);
  }

  decrement(): void {
    if (this.guestCount() > 1) {
      this.guestCount.update((v) => v - 1);
    }
  }

  increment(): void {
    if (this.guestCount() < 100) {
      this.guestCount.update((v) => v + 1);
    }
  }

  onSave(): void {
    this.isSaving.set(true);
    this.ordersService
      .ordersUpdateGuestCountPut({
        orderId: this.orderId,
        body: { guestCount: this.guestCount() },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () => {
          this.isSaving.set(false);
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถแก้ไขจำนวนลูกค้าได้',
          });
        },
      });
  }

  onClose(): void {
    this.ref.close();
  }
}
