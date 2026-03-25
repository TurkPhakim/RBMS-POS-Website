import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '@app/core/api/services/dashboard.service';
import { SalesReportResponseModel } from '@app/core/api/models/sales-report-response-model';
import { DailyBreakdownModel } from '@app/core/api/models/daily-breakdown-model';
import { ModalService } from '@app/core/services/modal.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-sales-report',
  standalone: false,
  templateUrl: './sales-report.component.html',
})
export class SalesReportComponent implements OnInit {
  report = signal<SalesReportResponseModel | null>(null);

  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  minEndDate = signal<Date | null>(null);
  activePreset: string | null = 'today';

  // Pie chart
  categoryPieData = signal<ChartData<'pie'>>({ labels: [], datasets: [] });
  categoryPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.setPreset('today');
  }

  setPreset(preset: string): void {
    this.activePreset = preset;
    const today = new Date();
    switch (preset) {
      case 'today':
        this.dateFrom = new Date(today);
        this.dateTo = new Date(today);
        break;
      case 'week':
        this.dateFrom = startOfWeek(today);
        this.dateTo = new Date(today);
        break;
      case 'month':
        this.dateFrom = startOfMonth(today);
        this.dateTo = new Date(today);
        break;
      case 'quarter':
        this.dateFrom = startOfQuarter(today);
        this.dateTo = new Date(today);
        break;
    }
    this.minEndDate.set(new Date(this.dateFrom));
    this.loadReport();
  }

  onDateFromChange(): void {
    this.activePreset = null;
    this.minEndDate.set(new Date(this.dateFrom));
    if (this.dateTo < this.dateFrom) {
      this.dateTo = new Date(this.dateFrom);
    }
  }

  onSearch(): void {
    this.activePreset = null;
    const diffDays =
      (this.dateTo.getTime() - this.dateFrom.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      this.modalService.cancel({
        title: 'ข้อผิดพลาด',
        message: 'ช่วงเวลาต้องไม่เกิน 365 วัน',
      });
      return;
    }
    this.loadReport();
  }

  // ─── KPI helpers ──────────────────────────────────────

  get kpiCards() {
    const s = this.report()?.summary;
    return [
      {
        label: 'ยอดขาย',
        value: this.formatCurrency(s?.totalSales ?? 0),
        icon: 'pi pi-dollar',
      },
      {
        label: 'จำนวนออเดอร์',
        value: (s?.orderCount ?? 0).toLocaleString(),
        icon: 'pi pi-shopping-cart',
      },
      {
        label: 'จำนวนลูกค้า',
        value: (s?.guestCount ?? 0).toLocaleString(),
        icon: 'pi pi-users',
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(s?.averagePerOrder ?? 0),
        icon: 'pi pi-chart-bar',
      },
    ];
  }

  get kitchenItems() {
    const colors: Record<number, string> = { 1: 'bg-primary', 2: 'bg-success', 3: 'bg-warning' };
    return (this.report()?.kitchenBreakdown ?? []).map((k) => ({
      categoryName: k.categoryName ?? '',
      itemCount: k.itemCount ?? 0,
      percentage: k.percentage ?? 0,
      barColor: colors[k.categoryType ?? 0] ?? 'bg-surface-sub',
    }));
  }

  get dailyBreakdown(): DailyBreakdownModel[] {
    return this.report()?.dailyBreakdown ?? [];
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatCurrency(value: number): string {
    return '฿' + value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ─── Private ──────────────────────────────────────────

  private loadReport(): void {
    const from = this.formatDateParam(this.dateFrom);
    const to = this.formatDateParam(this.dateTo);
    this.dashboardService
      .dashboardGetSalesReportGet({ from, to })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.report.set(res.result ?? null);
          this.updatePieChart();
        },
      });
  }

  private updatePieChart(): void {
    const cats = this.report()?.categoryBreakdown ?? [];
    const colors = ['#f97316', '#14b8a6', '#fbbf24'];
    this.categoryPieData.set({
      labels: cats.map((c) => c.categoryName ?? ''),
      datasets: [
        {
          data: cats.map((c) => c.totalSales ?? 0),
          backgroundColor: cats.map((_, i) => colors[i] ?? '#94a3b8'),
        },
      ],
    });
  }

  private formatDateParam(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

// ─── Date helpers ──────────────────────────────────────

function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start
  result.setDate(result.getDate() - diff);
  return result;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), quarterStartMonth, 1);
}
