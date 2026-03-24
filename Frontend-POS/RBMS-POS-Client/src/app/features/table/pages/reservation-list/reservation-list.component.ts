import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { ReservationsService } from '@app/core/api/services/reservations.service';
import { ReservationResponseModel } from '@app/core/api/models/reservation-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { ConfirmReservationDialogComponent } from '../../dialogs/confirm-reservation-dialog/confirm-reservation-dialog.component';
import { ReservationDialogComponent } from '../../dialogs/reservation-dialog/reservation-dialog.component';

const KEY_BTN_ADD = 'add-reservation';

const STATUS_OPTIONS = [
  { value: null, label: 'ทั้งหมด' },
  { value: 'Pending', label: 'รอยืนยัน' },
  { value: 'Confirmed', label: 'ยืนยันแล้ว' },
  { value: 'CheckedIn', label: 'เข้าร้านแล้ว' },
  { value: 'Cancelled', label: 'ยกเลิก' },
  { value: 'NoShow', label: 'ไม่มา' },
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_DAYS_FULL = [
  'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี',
  'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์',
];

// สีประจำวันแบบไทย (จันทร์-อาทิตย์)
const DAY_COLORS = [
  { label: 'จันทร์', color: '#FBBF24', bg: '#FEF9E7', headerBg: '#FEF3C7' },
  { label: 'อังคาร', color: '#F472B6', bg: '#FDF2F8', headerBg: '#FCE7F3' },
  { label: 'พุธ', color: '#34D399', bg: '#ECFDF5', headerBg: '#D1FAE5' },
  { label: 'พฤหัสบดี', color: '#FB923C', bg: '#FFF7ED', headerBg: '#FED7AA' },
  { label: 'ศุกร์', color: '#60A5FA', bg: '#EFF6FF', headerBg: '#DBEAFE' },
  { label: 'เสาร์', color: '#A78BFA', bg: '#F5F3FF', headerBg: '#EDE9FE' },
  { label: 'อาทิตย์', color: '#F87171', bg: '#FEF2F2', headerBg: '#FEE2E2' },
];

@Component({
  selector: 'app-reservation-list',
  standalone: false,
  templateUrl: './reservation-list.component.html',
  providers: [DialogService],
})
export class ReservationListComponent implements OnInit, OnDestroy {
  currentMonth = signal(new Date());
  selectedDate = signal<Date>(new Date());
  monthReservations = signal<ReservationResponseModel[]>([]);
  selectedStatus = signal<string | null>(null);

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  readonly dayColors = DAY_COLORS;

  private readonly today = new Date();

  // Computed: calendar grid
  calendarDays = computed(() => this.buildCalendarDays());

  // Computed: reservations grouped by date string
  private reservationMap = computed(() => {
    const map = new Map<string, ReservationResponseModel[]>();
    const status = this.selectedStatus();
    for (const r of this.monthReservations()) {
      if (status && r.status !== status) continue;
      const key = r.reservationDate ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  });

  // Computed: reservations for selected day (sorted by time)
  selectedDayReservations = computed(() => {
    const dateStr = this.formatDateStr(this.selectedDate());
    const items = this.reservationMap().get(dateStr) ?? [];
    return [...items].sort((a, b) =>
      (a.reservationTime ?? '').localeCompare(b.reservationTime ?? ''),
    );
  });

  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.canCreate = this.authService.hasPermission('reservation.create');
    this.canUpdate = this.authService.hasPermission('reservation.update');
    this.canDelete = this.authService.hasPermission('reservation.delete');
  }

  ngOnInit(): void {
    this.loadMonthReservations();
    this.setupBreadcrumbButtons();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  // ─── Calendar navigation ───

  onPrevMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() - 1);
    this.currentMonth.set(d);
    this.loadMonthReservations();
  }

  onNextMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    this.currentMonth.set(d);
    this.loadMonthReservations();
  }

  onSelectDate(day: CalendarDay): void {
    this.selectedDate.set(day.date);
    if (!day.isCurrentMonth) {
      this.currentMonth.set(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
      this.loadMonthReservations();
    }
  }

  onStatusChange(value: string | null): void {
    this.selectedStatus.set(value);
  }

  // ─── Display helpers ───

  formatMonthYear(): string {
    const d = this.currentMonth();
    return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  formatSelectedDate(): string {
    const d = this.selectedDate();
    const dayOfWeek = d.getDay();
    const thaiDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return `${THAI_DAYS_FULL[thaiDayIndex]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  getReservationCountForDate(dateStr: string): number {
    return this.reservationMap().get(dateStr)?.length ?? 0;
  }

  getStatusDots(dateStr: string): string[] {
    const items = this.reservationMap().get(dateStr);
    if (!items) return [];
    const statusSet = new Set<string>();
    const dots: string[] = [];
    for (const r of items) {
      const s = r.status ?? '';
      if (!statusSet.has(s)) {
        statusSet.add(s);
        dots.push(this.getStatusDotColor(s));
      }
      if (dots.length >= 4) break;
    }
    return dots;
  }

  isSelectedDate(day: CalendarDay): boolean {
    return this.formatDateStr(this.selectedDate()) === day.dateStr;
  }

  getDayCellBg(day: CalendarDay): string {
    if (this.isSelectedDate(day)) return '';
    if (!day.isCurrentMonth) return '';
    return DAY_COLORS[day.dayOfWeek].bg;
  }

  formatTime(time: string | null | undefined): string {
    if (!time) return '-';
    return time.substring(0, 5);
  }

  // ─── Action methods (เดิม) ───

  onEdit(reservation: ReservationResponseModel): void {
    this.openReservationDialog(reservation);
  }

  openReservationDialog(reservation: ReservationResponseModel | null): void {
    const isEdit = !!reservation;
    const ref = this.dialogService.open(ReservationDialogComponent, {
      header: isEdit ? 'แก้ไขการจอง' : 'เพิ่มการจอง',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '60vw',
      data: { reservation },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved: boolean) => {
        if (saved) this.loadMonthReservations();
      });
  }

  onConfirm(reservation: ReservationResponseModel): void {
    const ref = this.dialogService.open(ConfirmReservationDialogComponent, {
      header: 'ยืนยันการจอง',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '35vw',
      data: { reservation },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tableId: number | undefined) => {
        if (!tableId) return;
        this.reservationsService
          .reservationsConfirmReservationPost({
            reservationId: reservation.reservationId!,
            body: { tableId },
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadMonthReservations();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถยืนยันการจองได้',
              }),
          });
      });
  }

  onCheckIn(reservation: ReservationResponseModel): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยัน Check-in',
      message: `ลูกค้า "${reservation.customerName}" เข้าร้านแล้ว?`,
      onConfirm: () => {
        this.reservationsService
          .reservationsCheckInReservationPost({
            reservationId: reservation.reservationId!,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadMonthReservations();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถ Check-in ได้',
              }),
          });
      },
    });
  }

  onCancelReservation(reservation: ReservationResponseModel): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยันยกเลิก',
      message: `ต้องการยกเลิกการจองของ "${reservation.customerName}" หรือไม่?`,
      onConfirm: () => {
        this.reservationsService
          .reservationsCancelReservationPost({
            reservationId: reservation.reservationId!,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadMonthReservations();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถยกเลิกได้',
              }),
          });
      },
    });
  }

  onNoShow(reservation: ReservationResponseModel): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยืนยัน No-show',
      message: `ลูกค้า "${reservation.customerName}" ไม่มาตามนัด?`,
      onConfirm: () => {
        this.reservationsService
          .reservationsNoShowReservationPost({
            reservationId: reservation.reservationId!,
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.loadMonthReservations();
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถบันทึกได้',
              }),
          });
      },
    });
  }

  getStatusLabel(status: string | null | undefined): string {
    return (
      STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status ?? '-'
    );
  }

  getStatusColor(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'text-warning';
      case 'Confirmed':
        return 'text-primary';
      case 'CheckedIn':
        return 'text-success';
      case 'Cancelled':
        return 'text-danger';
      case 'NoShow':
        return 'text-surface-sub';
      default:
        return '';
    }
  }

  getStatusBgColor(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'bg-warning-bg';
      case 'Confirmed':
        return 'bg-primary-subtle';
      case 'CheckedIn':
        return 'bg-success-bg';
      case 'Cancelled':
        return 'bg-danger-bg';
      case 'NoShow':
        return 'bg-surface';
      default:
        return '';
    }
  }

  isPastReservation(item: ReservationResponseModel): boolean {
    if (!item.reservationDate || !item.reservationTime) return false;
    const [y, m, d] = item.reservationDate.split('-').map(Number);
    const [h, min] = item.reservationTime.split(':').map(Number);
    const reservationDt = new Date(y, m - 1, d, h, min);
    return reservationDt.getTime() < Date.now();
  }

  getStatusBorderColor(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'border-l-warning';
      case 'Confirmed':
        return 'border-l-primary';
      case 'CheckedIn':
        return 'border-l-success';
      case 'Cancelled':
        return 'border-l-danger';
      case 'NoShow':
        return 'border-l-surface-sub';
      default:
        return '';
    }
  }

  // ─── Private ───

  private loadMonthReservations(): void {
    const d = this.currentMonth();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    this.reservationsService
      .reservationsGetReservationsGet({
        dateFrom: this.formatDateStr(firstDay),
        dateTo: this.formatDateStr(lastDay),
        ItemPerPage: 9999,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.monthReservations.set(res.results ?? []),
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถโหลดข้อมูลได้',
          }),
      });
  }

  private buildCalendarDays(): CalendarDay[] {
    const d = this.currentMonth();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDow = firstOfMonth.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];

    // Padding from previous month
    const prevMonthLast = new Date(year, month, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(this.createCalendarDay(date, false));
    }

    // Current month days
    for (let day = 1; day <= lastOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(this.createCalendarDay(date, true));
    }

    // Padding for next month (fill to 42 = 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createCalendarDay(date, false));
    }

    return days;
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const jsDay = date.getDay(); // 0=Sun, 1=Mon...6=Sat
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon...6=Sun
    return {
      date,
      dateStr: this.formatDateStr(date),
      day: date.getDate(),
      dayOfWeek,
      isCurrentMonth,
      isToday:
        date.getDate() === this.today.getDate() &&
        date.getMonth() === this.today.getMonth() &&
        date.getFullYear() === this.today.getFullYear(),
    };
  }

  private formatDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private getStatusDotColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-warning';
      case 'Confirmed':
        return 'bg-primary';
      case 'CheckedIn':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      case 'NoShow':
        return 'bg-surface-sub';
      default:
        return 'bg-surface-muted';
    }
  }

  private setupBreadcrumbButtons(): void {
    if (!this.canCreate) return;
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_ADD,
      type: 'button',
      item: {
        key: KEY_BTN_ADD,
        label: 'เพิ่มการจอง',
        severity: 'primary',
        callback: () => this.openReservationDialog(null),
      },
    });
  }
}

interface CalendarDay {
  date: Date;
  dateStr: string;
  day: number;
  dayOfWeek: number; // 0=จันทร์ ... 6=อาทิตย์
  isCurrentMonth: boolean;
  isToday: boolean;
}
