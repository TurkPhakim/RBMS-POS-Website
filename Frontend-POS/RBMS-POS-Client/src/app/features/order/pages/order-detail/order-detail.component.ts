import { Component, computed, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

import { OrderDetailResponseModel, OrderItemResponseModel } from '@app/core/api/models';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { OrdersService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { Icon, ModalService } from '@app/core/services/modal.service';
import { CancelReasonDialogComponent } from '../../dialogs/cancel-reason-dialog/cancel-reason-dialog.component';
import { SplitBillDialogComponent } from '@app/shared/dialogs/split-bill-dialog/split-bill-dialog.component';

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

  filteredItems = computed(() => {
    const items = this.order()?.items ?? [];
    const cat = this.categoryFilter();
    if (cat === null) return items;
    return items.filter(i => i.categoryType === cat);
  });

  hasPendingItems = computed(() => {
    const items = this.order()?.items;
    return items?.some(i => i.status === 'Pending') ?? false;
  });

  allItemsFinal = computed(() => {
    const items = this.order()?.items;
    if (!items?.length) return false;
    return items.every(i => FINAL_STATUSES.includes(i.status!));
  });

  hasServedItems = computed(() => {
    const items = this.order()?.items;
    return items?.some(i => i.status === 'Served') ?? false;
  });

  canRequestBill = computed(() => this.allItemsFinal() && this.hasServedItems());

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly authService: AuthService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly destroyRef: DestroyRef,
    private readonly dialogService: DialogService,
    private readonly modalService: ModalService,
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
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
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
        callback: () => this.router.navigate(['/order']),
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
      case 1: return 'chicken-drumstick';
      case 2: return 'drinks-glass';
      case 3: return 'dessert';
      default: return 'food';
    }
  }

  getBannerGradient(status: string | null | undefined): string {
    switch (status) {
      case 'Open': return 'bg-gradient-to-r from-primary to-primary-badge';
      case 'Billing': return 'bg-gradient-to-r from-billing to-billing';
      case 'Completed': return 'bg-gradient-to-r from-success to-success-text';
      case 'Cancelled': return 'bg-gradient-to-r from-danger to-danger-dark';
      default: return 'bg-gradient-to-r from-primary to-primary-badge';
    }
  }

  getStatusColor(status: string | null | undefined, asText = false): string {
    const prefix = asText ? 'text-' : 'bg-';
    switch (status) {
      case 'Open': return prefix + 'primary';
      case 'Billing': return prefix + 'billing';
      case 'Completed': return prefix + 'success';
      case 'Cancelled': return prefix + 'danger';
      default: return prefix + 'primary';
    }
  }

  getItemStatusBadge(status: string | null | undefined): string {
    switch (status) {
      case 'Pending': return 'text-surface-sub';
      case 'Sent': return 'text-info';
      case 'Preparing': return 'text-warning-dark';
      case 'Ready': return 'text-success-text';
      case 'Served': return 'text-success-text';
      case 'Voided': return 'text-danger';
      case 'Cancelled': return 'text-danger';
      default: return '';
    }
  }

  onAddItems(): void {
    const o = this.order();
    this.router.navigate(['/order', this.orderId, 'add-items'], {
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
        return this.ordersService.ordersSendToKitchenPost({ orderId: this.orderId });
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
        return this.ordersService.ordersRequestBillPost({ orderId: this.orderId });
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
        this.modalService.commonSuccess();
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

  onSplitBill(): void {
    const o = this.order();
    if (!o) return;
    const ref = this.dialogService.open(SplitBillDialogComponent, {
      header: 'แยกบิลชำระเงิน',
      showHeader: false,
      styleClass: 'card-dialog',
      width: '55vw',
      data: { items: o.items },
    });
    ref.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: { mode: string; numberOfSplits?: number; groups?: { orderItemIds: number[] }[] } | undefined) => {
        if (!result) return;
        if (result.mode === 'by-amount') {
          this.ordersService
            .ordersSplitByAmountPost({
              orderId: this.orderId,
              body: { numberOfSplits: result.numberOfSplits! },
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.modalService.commonSuccess();
                this.loadOrder();
              },
            });
        } else {
          this.ordersService
            .ordersSplitByItemPost({
              orderId: this.orderId,
              body: { groups: result.groups! },
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

  onServeItem(item: OrderItemResponseModel): void {
    this.ordersService
      .ordersServeItemPut({ orderItemId: item.orderItemId! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.commonSuccess();
          this.loadOrder();
        },
      });
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Pending': return 'รอส่งครัว';
      case 'Sent': return 'ส่งครัวแล้ว';
      case 'Preparing': return 'กำลังทำ';
      case 'Ready': return 'พร้อมเสิร์ฟ';
      case 'Served': return 'เสิร์ฟแล้ว';
      case 'Voided': return 'ลบรายการ';
      case 'Cancelled': return 'ยกเลิก';
      default: return status ?? '-';
    }
  }

  getItemStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Pending': return 'bg-surface-hover';
      case 'Sent': return 'bg-info/10 text-info';
      case 'Preparing': return 'bg-warning/10 text-warning';
      case 'Ready': return 'bg-success/10 text-success';
      case 'Served': return 'bg-success/20 text-success';
      case 'Voided': return 'bg-danger/10 text-danger opacity-60';
      case 'Cancelled': return 'bg-danger/10 text-danger opacity-60';
      default: return '';
    }
  }

  getOrderStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Open': return 'เปิด';
      case 'Billing': return 'รอชำระ';
      case 'Completed': return 'เสร็จสิ้น';
      case 'Cancelled': return 'ยกเลิก';
      default: return status ?? '-';
    }
  }

  getOrderStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Open': return 'text-primary';
      case 'Billing': return 'text-warning';
      case 'Completed': return 'text-success';
      case 'Cancelled': return 'text-danger';
      default: return '';
    }
  }
}
