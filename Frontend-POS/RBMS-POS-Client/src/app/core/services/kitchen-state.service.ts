import { DestroyRef, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KitchenOrderModel } from '@app/core/api/models';
import { KitchenService } from '@app/core/api/services';
import { OrderHubService } from './order-hub.service';

@Injectable({
  providedIn: 'root',
})
export class KitchenStateService {
  readonly orders = signal<KitchenOrderModel[]>([]);
  readonly isLoading = signal(false);

  private currentCategory = 1;
  private connected = false;

  constructor(
    private readonly kitchenService: KitchenService,
    private readonly orderHubService: OrderHubService,
  ) {}

  connect(destroyRef: DestroyRef): void {
    // Always subscribe (previous subscriptions auto-cleaned by takeUntilDestroyed)
    this.orderHubService.newOrderItems$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.loadItems());

    this.orderHubService.itemStatusChanged$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.loadItems());

    this.orderHubService.itemCancelled$
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.loadItems());

    // Start SignalR connection once (persists across kitchen pages)
    if (!this.connected) {
      this.connected = true;
      this.orderHubService.start('kitchen');
    }
  }

  disconnect(): void {
    // Only clear data; keep SignalR connection alive to avoid race condition
    // when navigating between kitchen pages (food/beverage/dessert)
    this.orders.set([]);
  }

  loadItems(categoryType?: number): void {
    if (categoryType !== undefined) {
      this.currentCategory = categoryType;
    }

    this.isLoading.set(true);
    this.kitchenService
      .kitchenGetKitchenItemsGet({ categoryType: this.currentCategory, includeReady: true })
      .subscribe({
        next: (res) => {
          this.orders.set(res.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  startPreparing(orderItemIds: number[], categoryType: number): void {
    this.kitchenService
      .kitchenStartPreparingPut({ body: { categoryType, orderItemIds } })
      .subscribe();
  }

  markReady(orderItemIds: number[], categoryType: number): void {
    this.kitchenService
      .kitchenMarkReadyPut({ body: { categoryType, orderItemIds } })
      .subscribe();
  }
}
