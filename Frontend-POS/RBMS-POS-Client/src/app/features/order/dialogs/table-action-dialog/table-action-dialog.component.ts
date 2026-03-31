import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService,
} from 'primeng/dynamicdialog';
import { OrdersService } from '@app/core/api/services/orders.service';
import { TablesService } from '@app/core/api/services/tables.service';
import { ReservationsService } from '@app/core/api/services/reservations.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { OpenTableDialogComponent } from '../open-table-dialog/open-table-dialog.component';
import { MoveTableDialogComponent } from '../move-table-dialog/move-table-dialog.component';
import { LinkTableDialogComponent } from '../link-table-dialog/link-table-dialog.component';
import { QrCodeDialogComponent } from '../qr-code-dialog/qr-code-dialog.component';
import { EditGuestCountDialogComponent } from '../edit-guest-count-dialog/edit-guest-count-dialog.component';

const KITCHEN_STATUSES = ['Sent', 'Preparing', 'Ready', 'Served'];

@Component({
  selector: 'app-table-action-dialog',
  standalone: false,
  templateUrl: './table-action-dialog.component.html',
  providers: [DialogService],
})
export class TableActionDialogComponent {
  table: TableResponseModel;
  canUpdate: boolean;
  canCloseTable = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly router: Router,
    private readonly ordersService: OrdersService,
    private readonly tablesService: TablesService,
    private readonly reservationsService: ReservationsService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.table = this.config.data.table;
    this.canUpdate = this.authService.hasPermission('table-manage.update');
    this.checkCanCloseTable();
  }

  private checkCanCloseTable(): void {
    if (this.table.status !== 'Occupied' && this.table.status !== 'Billing')
      return;

    this.ordersService
      .ordersGetActiveOrderByTableGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.result?.items ?? [];
          const hasKitchenItems = items.some((i) =>
            KITCHEN_STATUSES.includes(i.status!),
          );
          this.canCloseTable.set(!hasKitchenItems);
        },
        error: () => this.canCloseTable.set(true),
      });
  }

  getStatusLabel(): string {
    switch (this.table.status) {
      case 'Available':
        return 'ว่าง';
      case 'Occupied':
        if ((this.table.totalActiveItemCount ?? 0) === 0) return 'ยังไม่สั่ง';
        if ((this.table.unservedItemCount ?? 0) > 0) return 'รอเสิร์ฟ';
        return 'เสิร์ฟครบ';
      case 'Billing':
        return 'เช็คบิล';
      case 'Reserved':
        return 'จองแล้ว';
      case 'Cleaning':
        return 'เคลียร์โต๊ะ';
      case 'Unavailable':
        return 'ปิดใช้งาน';
      default:
        return '-';
    }
  }

  getTableBgClasses(): string {
    switch (this.table.status) {
      case 'Available':
        return 'bg-surface-sub';
      case 'Occupied':
        if ((this.table.totalActiveItemCount ?? 0) === 0) return 'bg-amber';
        if ((this.table.unservedItemCount ?? 0) > 0) return 'bg-primary';
        return 'bg-success-dark';
      case 'Billing':
        return 'bg-billing';
      case 'Reserved':
        return 'bg-info';
      case 'Cleaning':
        return 'bg-surface-sidebar';
      case 'Unavailable':
        return 'bg-danger';
      default:
        return 'bg-surface-sub';
    }
  }

  getStatusBadgeClasses(): string {
    switch (this.table.status) {
      case 'Available':
        return 'bg-surface text-surface-sub';
      case 'Occupied':
        if ((this.table.totalActiveItemCount ?? 0) === 0)
          return 'bg-amber-bg text-amber';
        if ((this.table.unservedItemCount ?? 0) > 0)
          return 'bg-primary-subtle text-primary';
        return 'bg-success-bg text-success-dark';
      case 'Billing':
        return 'bg-billing-bg text-billing';
      case 'Reserved':
        return 'bg-info-bg text-info';
      case 'Cleaning':
        return 'bg-surface text-surface-sidebar';
      case 'Unavailable':
        return 'bg-danger-bg text-danger';
      default:
        return 'bg-surface text-surface-sub';
    }
  }

  getStatusDotClasses(): string {
    switch (this.table.status) {
      case 'Available':
        return 'bg-surface-sub';
      case 'Occupied':
        if ((this.table.totalActiveItemCount ?? 0) === 0) return 'bg-amber';
        if ((this.table.unservedItemCount ?? 0) > 0) return 'bg-primary';
        return 'bg-success-dark';
      case 'Billing':
        return 'bg-billing';
      case 'Reserved':
        return 'bg-info';
      case 'Cleaning':
        return 'bg-surface-sidebar';
      case 'Unavailable':
        return 'bg-danger';
      default:
        return 'bg-surface-sub';
    }
  }

  onCheckInReservation(): void {
    // หา reservation ที่ Confirmed ของโต๊ะนี้ แล้ว check-in ตรงๆ
    this.reservationsService
      .reservationsGetTodayReservationsGet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const reservation = (res.results ?? []).find(
            (r) => r.tableId === this.table.tableId && r.status === 'Confirmed',
          );
          if (!reservation) {
            this.modalService.cancel({
              title: 'ไม่พบการจอง',
              message: 'ไม่พบการจองที่ยืนยันแล้วสำหรับโต๊ะนี้',
            });
            return;
          }
          this.reservationsService
            .reservationsCheckInReservationPost({
              reservationId: reservation.reservationId!,
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                // ดึง QR Token แล้วแสดง
                this.tablesService
                  .tablesGetQrTokenGet({ tableId: this.table.tableId! })
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: (qrRes) => {
                      const qrToken = qrRes.result;
                      if (qrToken) {
                        const qrRef = this.dialogService.open(
                          QrCodeDialogComponent,
                          {
                            header: `QR Code — ${this.table.tableName}`,
                            data: { table: this.table, qrToken },
                            showHeader: false,
                            styleClass: 'card-dialog',
                            width: '35vw',
                            modal: true,
                          },
                        );
                        qrRef.onClose
                          .pipe(takeUntilDestroyed(this.destroyRef))
                          .subscribe(() => this.ref.close(true));
                      } else {
                        this.ref.close(true);
                      }
                    },
                    error: () => this.ref.close(true),
                  });
              },
              error: () =>
                this.modalService.cancel({
                  title: 'เกิดข้อผิดพลาด',
                  message: 'ไม่สามารถเช็คอินได้',
                }),
            });
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถดึงข้อมูลการจองได้',
          }),
      });
  }

  onOpenTable(): void {
    const dialogRef = this.dialogService.open(OpenTableDialogComponent, {
      header: `เปิดโต๊ะ ${this.table.tableName}`,
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog card-dialog--visible',
      width: '40vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.ref.close(true);
      });
  }

  onCloseTable(): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ปิดโต๊ะ',
      message: `ต้องการปิดโต๊ะ "${this.table.tableName}" หรือไม่?`,
      onConfirm: () => {
        this.tablesService
          .tablesCloseTablePost({ tableId: this.table.tableId! })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.ref.close(true);
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถปิดโต๊ะได้',
              }),
          });
      },
    });
  }

  onCleanTable(): void {
    this.tablesService
      .tablesCleanTablePost({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.ref.close(true),
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถอัพเดตสถานะได้',
          }),
      });
  }

  onMoveTable(): void {
    const dialogRef = this.dialogService.open(MoveTableDialogComponent, {
      header: `ย้ายโต๊ะ ${this.table.tableName}`,
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog card-dialog--visible',
      width: '50vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.ref.close(true);
      });
  }

  onLinkTables(): void {
    const dialogRef = this.dialogService.open(LinkTableDialogComponent, {
      header: 'เชื่อมโต๊ะ',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '50vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.ref.close(true);
      });
  }

  onUnlinkTables(): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยกเลิกการเชื่อม',
      message: [
        'ยกเลิกการเชื่อมโต๊ะกลุ่มนี้?',
        'ออเดอร์จะถูกแยกกลับตามโต๊ะเดิม',
      ],
      onConfirm: () => {
        this.tablesService
          .tablesUnlinkTablesDelete({ groupCode: this.table.linkedGroupCode! })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.ref.close(true);
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถยกเลิกการเชื่อมได้',
              }),
          });
      },
    });
  }

  onUnlinkSingleTable(): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'แยกโต๊ะ',
      message: ['แยกโต๊ะนี้ออกจากกลุ่ม?', 'ออเดอร์ของโต๊ะนี้จะถูกแยกออก'],
      onConfirm: () => {
        this.tablesService
          .tablesUnlinkSingleTableDelete({ tableId: this.table.tableId! })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.modalService.commonSuccess();
              this.ref.close(true);
            },
            error: () =>
              this.modalService.cancel({
                title: 'เกิดข้อผิดพลาด',
                message: 'ไม่สามารถแยกโต๊ะได้',
              }),
          });
      },
    });
  }

  onSetUnavailable(): void {
    this.tablesService
      .tablesSetUnavailablePost({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถปิดใช้งานได้',
          }),
      });
  }

  onSetAvailable(): void {
    this.tablesService
      .tablesSetAvailablePost({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถเปิดใช้งานได้',
          }),
      });
  }

  onEditGuestCount(): void {
    this.ordersService
      .ordersGetActiveOrderByTableGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const orderId = res.result?.orderId;
          if (!orderId) {
            this.modalService.cancel({
              title: 'ไม่พบออเดอร์',
              message: 'โต๊ะนี้ยังไม่มีออเดอร์',
            });
            return;
          }
          const dialogRef = this.dialogService.open(
            EditGuestCountDialogComponent,
            {
              header: 'แก้ไขจำนวนลูกค้า',
              showHeader: false,
              styleClass: 'card-dialog card-dialog--visible',
              width: '35vw',
              data: {
                orderId,
                currentGuests: this.table.currentGuests ?? 1,
              },
            },
          );
          dialogRef.onClose
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
              if (result) this.ref.close(true);
            });
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถดึงข้อมูลออเดอร์ได้',
          }),
      });
  }

  onShowQrCode(): void {
    this.tablesService
      .tablesGetQrTokenGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const qrToken = res.result;
          if (!qrToken) {
            this.modalService.cancel({
              title: 'ไม่พบ QR Code',
              message: 'โต๊ะนี้ยังไม่มี QR Token',
            });
            return;
          }
          this.dialogService.open(QrCodeDialogComponent, {
            header: `QR Code — ${this.table.tableName}`,
            data: { table: this.table, qrToken },
            showHeader: false,
            styleClass: 'card-dialog',
            width: '33vw',
            modal: true,
          });
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถดึง QR Code ได้',
          }),
      });
  }

  onViewOrder(): void {
    this.ordersService
      .ordersGetActiveOrderByTableGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const orderId = res.result?.orderId;
          if (!orderId) {
            this.modalService.cancel({
              title: 'ไม่พบออเดอร์',
              message: 'โต๊ะนี้ยังไม่มีออเดอร์',
            });
            return;
          }
          this.ref.close();
          this.router.navigate(['/order', 'list', orderId]);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถดึงข้อมูลออเดอร์ได้',
          }),
      });
  }

  onGoToCheckout(): void {
    this.ordersService
      .ordersGetActiveOrderByTableGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const orderId = res.result?.orderId;
          if (!orderId) {
            this.modalService.cancel({
              title: 'ไม่พบออเดอร์',
              message: 'โต๊ะนี้ยังไม่มีออเดอร์',
            });
            return;
          }
          this.ref.close();
          this.router.navigate(['/payment', 'checkout', orderId]);
        },
        error: () =>
          this.modalService.cancel({
            title: 'เกิดข้อผิดพลาด',
            message: 'ไม่สามารถดึงข้อมูลออเดอร์ได้',
          }),
      });
  }

  onClose(): void {
    this.ref.close();
  }
}
