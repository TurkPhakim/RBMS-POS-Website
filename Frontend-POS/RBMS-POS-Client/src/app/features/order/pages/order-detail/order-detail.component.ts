import {
  Component,
  computed,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import {
  OrderDetailResponseModel,
  OrderItemResponseModel,
  OrderLinkedTableModel,
} from '@app/core/api/models';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { OrdersService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { OrderHubService } from '@app/core/services/order-hub.service';
import { CancelReasonDialogComponent } from '../../dialogs/cancel-reason-dialog/cancel-reason-dialog.component';

const KEY_BTN_BACK = 'back-order';
const KEY_BTN_ADD_ITEMS = 'add-items-order';
const FINAL_STATUSES = ['Served', 'Voided', 'Cancelled'];
const CATEGORY_LABELS: Record<number, string> = {
  1: 'อาหาร',
  2: 'เครื่องดื่ม',
  3: 'ของหวาน',
};

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html',
  providers: [DialogService],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order = signal<OrderDetailResponseModel | null>(null);
  canUpdate: boolean;
  canDelete: boolean;
  orderId = 0;

  categoryFilter = signal<number | null>(null);
  sourceTableFilter = signal<string | null>(null);

  filteredItems = computed(() => {
    let items = this.order()?.items ?? [];
    const cat = this.categoryFilter();
    if (cat !== null) {
      items = items.filter((i) => i.categoryType === cat);
    }
    const st = this.sourceTableFilter();
    if (st !== null) {
      items = items.filter((i) => i.sourceTableName === st);
    }
    return items;
  });

  sourceTableNames = computed(() => {
    const items = this.order()?.items ?? [];
    const names = new Set(
      items.map((i) => i.sourceTableName).filter(Boolean) as string[],
    );
    return Array.from(names);
  });

  hasMultipleSourceTables = computed(() => {
    const items = this.order()?.items ?? [];
    const names = new Set(
      items.map((i) => i.sourceTableName).filter(Boolean),
    );
    return names.size > 1;
  });

  hasPendingItems = computed(() => {
    const items = this.order()?.items;
    return items?.some((i) => i.status === 'Pending') ?? false;
  });

  hasReadyItems = computed(() => {
    const items = this.order()?.items;
    return items?.some((i) => i.status === 'Ready') ?? false;
  });

  allItemsFinal = computed(() => {
    const items = this.order()?.items;
    if (!items?.length) return false;
    return items.every((i) => FINAL_STATUSES.includes(i.status!));
  });

  hasServedItems = computed(() => {
    const items = this.order()?.items;
    return items?.some((i) => i.status === 'Served') ?? false;
  });

  canRequestBill = computed(
    () => this.allItemsFinal() && this.hasServedItems(),
  );

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly modalService: ModalService,
    private readonly orderHubService: OrderHubService,
    private readonly ordersService: OrdersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.canUpdate = this.authService.hasPermission('order-manage.update');
    this.canDelete = this.authService.hasPermission('order-manage.delete');
  }

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.setupBreadcrumbButtons();
    this.loadOrder();
    this.connectSignalR();
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
    this.orderHubService.leaveGroup('floor');
  }

  private connectSignalR(): void {
    this.orderHubService.start('floor');
    this.orderHubService.orderUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data.orderId === this.orderId) this.loadOrder();
      });
    this.orderHubService.itemStatusChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data.orderId === this.orderId) this.loadOrder();
      });
    this.orderHubService.newOrderItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data.orderId === this.orderId) this.loadOrder();
      });
    this.orderHubService.itemCancelled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data.orderId === this.orderId) this.loadOrder();
      });
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_BACK,
      type: 'button',
      item: {
        key: KEY_BTN_BACK,
        label: 'ย้อนกลับ',
        severity: 'secondary',
        variant: 'outlined',
        callback: () => this.router.navigate(['/order', 'list']),
      },
    });
  }

  loadOrder(): void {
    this.ordersService
      .ordersGetOrderGet({ orderId: this.orderId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.order.set(res.result ?? null);
          this.updateActionButtons();
        },
      });
  }

  private updateActionButtons(): void {
    const o = this.order();
    if (o?.status === 'Open' && this.canUpdate) {
      this.breadcrumbService.addOrUpdateButton({
        key: KEY_BTN_ADD_ITEMS,
        type: 'button',
        item: {
          key: KEY_BTN_ADD_ITEMS,
          label: 'สั่งอาหาร',
          severity: 'primary',
          callback: () => this.onAddItems(),
        },
      });
    } else {
      this.breadcrumbService.removeButton(KEY_BTN_ADD_ITEMS);
    }
  }

  getImageUrl(fileId: number | null | undefined): string | null {
    return fileId ? `${this.apiConfig.rootUrl}/api/admin/file/${fileId}` : null;
  }

  getCategoryLabel(categoryType: number | undefined): string {
    return CATEGORY_LABELS[categoryType ?? 0] ?? '-';
  }

  getCategoryIcon(categoryType: number | undefined): string {
    switch (categoryType) {
      case 1:
        return 'chicken-drumstick';
      case 2:
        return 'drinks-glass';
      case 3:
        return 'dessert';
      default:
        return 'food';
    }
  }

  getBannerGradient(status: string | null | undefined): string {
    switch (status) {
      case 'Open':
        return 'bg-gradient-to-r from-primary to-primary-badge';
      case 'Billing':
        return 'bg-gradient-to-r from-billing to-billing';
      case 'Completed':
        return 'bg-gradient-to-r from-success to-success-text';
      default:
        return 'bg-gradient-to-r from-primary to-primary-badge';
    }
  }

  getStatusColor(status: string | null | undefined, asText = false): string {
    const prefix = asText ? 'text-' : 'bg-';
    switch (status) {
      case 'Open':
        return prefix + 'primary';
      case 'Billing':
        return prefix + 'billing';
      case 'Completed':
        return prefix + 'success';
      default:
        return prefix + 'primary';
    }
  }

  getItemStatusBadge(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'text-surface-sub';
      case 'Sent':
        return 'text-info';
      case 'Preparing':
        return 'text-warning-dark';
      case 'Ready':
        return 'text-success';
      case 'Served':
        return 'text-success-dark';
      case 'Voided':
        return 'text-danger';
      case 'Cancelled':
        return 'text-danger';
      default:
        return '';
    }
  }

  onAddItems(): void {
    const o = this.order();
    this.router.navigate(['/order', 'list', this.orderId, 'add-items'], {
      queryParams: {
        orderNumber: o?.orderNumber,
        zoneName: o?.zoneName,
        tableName: o?.tableName,
        guestCount: o?.guestCount,
      },
    });
  }

  onSendToKitchen(): void {
    const ref = this.modalService.info({
      title: 'ส่งครัว',
      message: 'ส่งรายการที่รอไปยังครัวทั้งหมด?',
      onConfirm: () => {
        return this.ordersService.ordersSendToKitchenPost({
          orderId: this.orderId,
        });
      },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && result !== false) {
          this.modalService.commonSuccess();
          this.loadOrder();
        }
      });
  }

  onRequestBill(): void {
    const ref = this.modalService.info({
      title: 'ขอบิล',
      message: 'ต้องการขอบิลสำหรับออเดอร์นี้?',
      onConfirm: () => {
        return this.ordersService.ordersRequestBillPost({
          orderId: this.orderId,
        });
      },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && result !== false) {
          this.modalService.commonSuccess();
          this.loadOrder();
        }
      });
  }

  onVoidItem(item: OrderItemResponseModel): void {
    this.ordersService
      .ordersVoidItemPut({ orderItemId: item.orderItemId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadOrder();
      });
  }

  onCancelItem(item: OrderItemResponseModel): void {
    const ref = this.dialogService.open(CancelReasonDialogComponent, {
      header: 'ยกเลิกออเดอร์',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '35vw',
      data: { item },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { cancelReason: string } | undefined) => {
        if (result) {
          this.ordersService
            .ordersCancelItemPut({
              orderItemId: item.orderItemId!,
              body: { cancelReason: result.cancelReason },
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.modalService.commonSuccess();
                this.loadOrder();
              },
            });
        }
      });
  }

  onGoToCheckout(): void {
    this.router.navigate(['/payment', 'checkout', this.orderId]);
  }

  onSendItemToKitchen(item: OrderItemResponseModel): void {
    this.ordersService
      .ordersSendItemToKitchenPost({ orderItemId: item.orderItemId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.loadOrder();
        },
      });
  }

  onServeItem(item: OrderItemResponseModel): void {
    this.ordersService
      .ordersServeItemPut({ orderItemId: item.orderItemId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadOrder(),
      });
  }

  onServeAllReady(): void {
    const ref = this.modalService.info({
      title: 'เสิร์ฟทั้งหมด',
      message: 'เสิร์ฟรายการที่พร้อมเสิร์ฟทั้งหมด?',
      onConfirm: () => {
        return this.ordersService.ordersServeAllReadyPut({
          orderId: this.orderId,
        });
      },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && result !== false) {
          this.modalService.commonSuccess();
          this.loadOrder();
        }
      });
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'รอส่งครัว';
      case 'Sent':
        return 'ส่งครัวแล้ว';
      case 'Preparing':
        return 'กำลังทำ';
      case 'Ready':
        return 'พร้อมเสิร์ฟ';
      case 'Served':
        return 'เสิร์ฟแล้ว';
      case 'Voided':
        return 'ลบรายการ';
      case 'Cancelled':
        return 'ยกเลิก';
      default:
        return status ?? '-';
    }
  }

  getItemStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Pending':
        return 'bg-surface-hover';
      case 'Sent':
        return 'bg-info-bg text-info';
      case 'Preparing':
        return 'bg-warning-bg text-warning-dark';
      case 'Ready':
        return 'bg-success-bg text-success';
      case 'Served':
        return 'bg-success-bg text-success-dark';
      case 'Voided':
        return 'bg-danger-bg text-danger opacity-60';
      case 'Cancelled':
        return 'bg-danger-bg text-danger opacity-60';
      default:
        return '';
    }
  }

  getSecondaryTables(o: OrderDetailResponseModel): OrderLinkedTableModel[] {
    return (o.linkedTables ?? []).filter((lt) => !lt.isPrimary);
  }

  getOrderStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Open':
        return 'เปิด';
      case 'Billing':
        return 'รอชำระ';
      case 'Completed':
        return 'เสร็จสิ้น';
      default:
        return status ?? '-';
    }
  }
}
