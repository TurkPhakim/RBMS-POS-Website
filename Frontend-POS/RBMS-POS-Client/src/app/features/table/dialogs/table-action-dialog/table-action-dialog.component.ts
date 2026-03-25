import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { OrdersService } from '@app/core/api/services/orders.service';
import { TablesService } from '@app/core/api/services/tables.service';
import { TableResponseModel } from '@app/core/api/models/table-response-model';
import { AuthService } from '@app/core/services/auth.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { OpenTableDialogComponent } from '../open-table-dialog/open-table-dialog.component';
import { MoveTableDialogComponent } from '../move-table-dialog/move-table-dialog.component';
import { LinkTableDialogComponent } from '../link-table-dialog/link-table-dialog.component';
import { QrCodeDialogComponent } from '../qr-code-dialog/qr-code-dialog.component';

const KITCHEN_STATUSES = ['Sent', 'Preparing', 'Ready', 'Served'];

@Component({
  selector: 'app-table-action-dialog',
  standalone: false,
  templateUrl: './table-action-dialog.component.html',
  providers: [DialogService],
})
export class TableActionDialogComponent {
  table: TableResponseModel;
  headerLabel: string;
  canUpdate: boolean;
  canCloseTable = signal(false);

  constructor(
    private readonly ref: DynamicDialogRef,
    readonly config: DynamicDialogConfig,
    private readonly router: Router,
    private readonly ordersService: OrdersService,
    private readonly tablesService: TablesService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly dialogService: DialogService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.table = this.config.data.table;
    this.headerLabel = this.config.header!;
    this.canUpdate = this.authService.hasPermission('table-manage.update');
    this.checkCanCloseTable();
  }

  private checkCanCloseTable(): void {
    if (this.table.status !== 'Occupied' && this.table.status !== 'Billing') return;

    this.ordersService.ordersGetActiveOrderByTableGet({ tableId: this.table.tableId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res.result?.items ?? [];
          const hasKitchenItems = items.some(i => KITCHEN_STATUSES.includes(i.status!));
          this.canCloseTable.set(!hasKitchenItems);
        },
        error: () => this.canCloseTable.set(true),
      });
  }

  getStatusLabel(): string {
    switch (this.table.status) {
      case 'Available': return 'ว่าง';
      case 'Occupied': return 'มีลูกค้า';
      case 'Billing': return 'เช็คบิล';
      case 'Reserved': return 'จองแล้ว';
      case 'Cleaning': return 'ทำความสะอาด';
      case 'Unavailable': return 'ปิดใช้งาน';
      default: return '-';
    }
  }

  getTableVisualClasses(): string {
    switch (this.table.status) {
      case 'Available': return 'border-success bg-success/10 text-success';
      case 'Occupied': return 'border-primary bg-primary/10 text-primary';
      case 'Billing': return 'border-warning bg-warning/10 text-warning';
      case 'Reserved': return 'border-info bg-info/10 text-info';
      case 'Cleaning': return 'border-surface-sub bg-surface text-surface-sub';
      case 'Unavailable': return 'border-danger bg-danger/10 text-danger';
      default: return 'border-surface-border bg-surface text-surface-sub';
    }
  }

  getStatusBadgeClasses(): string {
    switch (this.table.status) {
      case 'Available': return 'bg-success/10 text-success';
      case 'Occupied': return 'bg-primary/10 text-primary';
      case 'Billing': return 'bg-warning/10 text-warning';
      case 'Reserved': return 'bg-info/10 text-info';
      case 'Cleaning': return 'bg-surface text-surface-sub';
      case 'Unavailable': return 'bg-danger/10 text-danger';
      default: return 'bg-surface text-surface-sub';
    }
  }

  getStatusDotClasses(): string {
    switch (this.table.status) {
      case 'Available': return 'bg-success';
      case 'Occupied': return 'bg-primary';
      case 'Billing': return 'bg-warning';
      case 'Reserved': return 'bg-info';
      case 'Cleaning': return 'bg-surface-sub';
      case 'Unavailable': return 'bg-danger';
      default: return 'bg-surface-sub';
    }
  }

  onOpenTable(): void {
    const dialogRef = this.dialogService.open(OpenTableDialogComponent, {
      header: `เปิดโต๊ะ ${this.table.tableName}`,
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '35vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean | undefined) => {
        this.ref.close(result || undefined);
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
        next: () => {
          this.modalService.commonSuccess();
          this.ref.close(true);
        },
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
      styleClass: 'card-dialog',
      width: '35vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean | undefined) => {
        this.ref.close(result || undefined);
      });
  }

  onLinkTables(): void {
    const dialogRef = this.dialogService.open(LinkTableDialogComponent, {
      header: 'เชื่อมโต๊ะ',
      showHeader: false,
      modal: true,
      styleClass: 'card-dialog',
      width: '40vw',
      data: { table: this.table },
    });
    dialogRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: boolean | undefined) => {
        this.ref.close(result || undefined);
      });
  }

  onUnlinkTables(): void {
    this.modalService.info({
      icon: Icon.Question,
      title: 'ยกเลิกการเชื่อม',
      message: ['ยกเลิกการเชื่อมโต๊ะกลุ่มนี้?', 'ออเดอร์จะถูกแยกกลับตามโต๊ะเดิม'],
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
            width: '35vw',
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
            this.modalService.cancel({ title: 'ไม่พบออเดอร์', message: 'โต๊ะนี้ยังไม่มีออเดอร์' });
            return;
          }
          this.ref.close();
          this.router.navigate(['/order', orderId]);
        },
        error: () =>
          this.modalService.cancel({ title: 'เกิดข้อผิดพลาด', message: 'ไม่สามารถดึงข้อมูลออเดอร์ได้' }),
      });
  }

  onClose(): void {
    this.ref.close();
  }
}
