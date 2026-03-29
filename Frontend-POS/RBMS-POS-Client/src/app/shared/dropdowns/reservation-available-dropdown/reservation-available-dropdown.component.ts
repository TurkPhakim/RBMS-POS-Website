import {
  Component,
  EventEmitter,
  forwardRef,
  OnInit,
  Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { ReservationsService } from '@app/core/api/services';
import { ReservationResponseModel } from '@app/core/api/models/reservation-response-model';
import {
  DropdownBaseComponent,
  DROPDOWN_BASE_TEMPLATE,
} from '../dropdown-base/dropdown-base.component';
const NOT_IN_SYSTEM_VALUE = 0;

@Component({
  selector: 'app-reservation-available-dropdown',
  standalone: false,
  template: DROPDOWN_BASE_TEMPLATE,
  host: { class: 'block' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReservationAvailableDropdownComponent),
      multi: true,
    },
  ],
})
export class ReservationAvailableDropdownComponent
  extends DropdownBaseComponent
  implements OnInit
{
  @Output() reservationSelected =
    new EventEmitter<ReservationResponseModel | null>();

  private reservations: ReservationResponseModel[] = [];

  constructor(private readonly reservationsService: ReservationsService) {
    super();
    this.placeholder = 'เลือกการจอง';
    this.showClear = false;
    this.filter = false;
  }

  override ngOnInit(): void {
    this.reservationsService
      .reservationsGetTodayReservationsGet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();

          this.reservations = (response.results ?? []).filter((r) => {
            if (r.status !== 'Pending') return false;
            // แสดงเฉพาะรายการที่ยังไม่เลยเวลา
            if (r.reservationTime) {
              const parts = r.reservationTime.split(':');
              const resMinutes =
                parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
              return resMinutes >= nowMinutes;
            }
            return true;
          });

          this.options = [
            { value: NOT_IN_SYSTEM_VALUE, label: 'ไม่ได้อยู่ในระบบจอง' },
            ...this.reservations.map((r) => ({
              value: r.reservationId,
              label: `${r.customerName} - ${this.formatTime(r.reservationTime)} (${r.guestCount} คน)`,
            })),
          ];
        },
      });

    super.ngOnInit();
  }

  override onValueChange(value: any): void {
    super.onValueChange(value);

    if (value && value !== NOT_IN_SYSTEM_VALUE) {
      const found = this.reservations.find((r) => r.reservationId === value);
      this.reservationSelected.emit(found ?? null);
    } else {
      this.reservationSelected.emit(null);
    }
  }

  private formatTime(time?: string): string {
    if (!time) return '';
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
}
