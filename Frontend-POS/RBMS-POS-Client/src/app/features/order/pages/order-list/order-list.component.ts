import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { OrderResponseModel } from '@app/core/api/models';
import { OrdersService } from '@app/core/api/services';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
  orders = signal<OrderResponseModel[]>([]);
  totalRecords = signal(0);
  canCreate: boolean;
  canUpdate: boolean;
  canPayment: boolean;

  searchTerm = '';
  zoneFilter: number | null = null;
  tableFilter: number | null = null;
  statusFilter: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  page = 1;
  rows = 10;

  constructor(
    private readonly authService: AuthService,
    private readonly destroyRef: DestroyRef,
    private readonly ordersService: OrdersService,
    private readonly router: Router,
  ) {
    this.canCreate = this.authService.hasPermission('order-manage.create');
    this.canUpdate = this.authService.hasPermission('order-manage.update');
    this.canPayment = this.authService.hasPermission('payment-manage.create');
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService
      .ordersGetOrdersGet({
        Page: this.page,
        ItemPerPage: this.rows,
        Search: this.searchTerm || undefined,
        status: this.statusFilter || undefined,
        tableId: this.tableFilter ?? undefined,
        dateFrom: this.dateFrom?.toISOString(),
        dateTo: this.dateTo?.toISOString(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
      });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadOrders();
  }

  onZoneChange(value: number | null): void {
    this.zoneFilter = value;
    this.tableFilter = null;
    this.onFilterChange();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.page = Math.floor((event.first ?? 0) / (event.rows ?? this.rows)) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadOrders();
  }

  onViewDetail(orderId: number): void {
    this.router.navigate(['/order', orderId]);
  }

  onGoToCheckout(orderId: number): void {
    this.router.navigate(['/payment', 'checkout', orderId]);
  }

  getStatusLabel(status: string | null | undefined): string {
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

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Open':
        return 'text-primary font-bold';
      case 'Billing':
        return 'text-billing font-bold';
      case 'Completed':
        return 'text-success font-bold';
      default:
        return '';
    }
  }
}
