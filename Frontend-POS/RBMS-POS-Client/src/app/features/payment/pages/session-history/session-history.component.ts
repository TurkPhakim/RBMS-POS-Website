import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';

import { CashierSessionResponseModel } from '@app/core/api/models/cashier-session-response-model';
import { CashierSessionsService } from '@app/core/api/services/cashier-sessions.service';
import { ShopBrandingService } from '@app/core/services/shop-branding.service';

@Component({
  selector: 'app-session-history',
  standalone: false,
  templateUrl: './session-history.component.html',
})
export class SessionHistoryComponent implements OnInit {
  sessions = signal<CashierSessionResponseModel[]>([]);
  totalRecords = signal(0);

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  shiftPeriod: number | null = null;

  hasTwoPeriods;

  constructor(
    private cashierSessionsService: CashierSessionsService,
    private shopBrandingService: ShopBrandingService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {
    this.hasTwoPeriods = this.shopBrandingService.hasTwoPeriods;
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(event?: TableLazyLoadEvent): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? 10;
    const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;
    const itemPerPage = rows;

    this.cashierSessionsService.cashierSessionsGetSessionHistoryGet({
      Page: page,
      ItemPerPage: itemPerPage,
      dateFrom: this.dateFrom?.toISOString(),
      dateTo: this.dateTo?.toISOString(),
      shiftPeriod: this.shiftPeriod ?? undefined,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.sessions.set(res.results ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
      });
  }

  onFilterChange(): void {
    this.loadHistory();
  }

  onViewDetail(session: CashierSessionResponseModel): void {
    this.router.navigate(['/payment', 'session-history', session.cashierSessionId]);
  }
}
