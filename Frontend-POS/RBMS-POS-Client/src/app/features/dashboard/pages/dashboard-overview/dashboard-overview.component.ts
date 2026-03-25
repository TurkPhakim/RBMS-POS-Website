import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '@app/core/api/services/dashboard.service';
import { DashboardOverviewResponseModel } from '@app/core/api/models/dashboard-overview-response-model';
import { TopSellingResponseModel } from '@app/core/api/models/top-selling-response-model';
import { PeakHoursResponseModel } from '@app/core/api/models/peak-hours-response-model';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard-overview',
  standalone: false,
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent implements OnInit {
  overview = signal<DashboardOverviewResponseModel | null>(null);
  topSelling = signal<TopSellingResponseModel | null>(null);
  peakHours = signal<PeakHoursResponseModel | null>(null);

  selectedDate: Date = new Date();
  trendDays: 7 | 30 = 7;

  // Revenue Trend Chart
  revenueTrendData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  revenueTrendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => '฿' + Number(v).toLocaleString(),
        },
      },
    },
  };

  // Top Selling Charts (3 horizontal bars)
  foodChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  beverageChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  dessertChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  topSellingOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // Peak Hours Chart
  peakHoursData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  peakHoursOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  onDateChange(): void {
    this.loadAllData();
  }

  onTrendToggle(days: 7 | 30): void {
    this.trendDays = days;
    this.loadOverview();
  }

  onRefresh(): void {
    this.loadAllData();
  }

  // ─── KPI helpers ──────────────────────────────────────

  get kpiCards() {
    const s = this.overview()?.selected;
    const p = this.overview()?.previous;
    return [
      {
        label: 'ยอดขาย',
        value: this.formatCurrency(s?.totalSales ?? 0),
        icon: 'pi pi-dollar',
        changePercent: this.calcChange(s?.totalSales, p?.totalSales),
      },
      {
        label: 'จำนวนออเดอร์',
        value: (s?.orderCount ?? 0).toLocaleString(),
        icon: 'pi pi-shopping-cart',
        changePercent: this.calcChange(s?.orderCount, p?.orderCount),
      },
      {
        label: 'จำนวนลูกค้า',
        value: (s?.guestCount ?? 0).toLocaleString(),
        icon: 'pi pi-users',
        changePercent: this.calcChange(s?.guestCount, p?.guestCount),
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(s?.averagePerOrder ?? 0),
        icon: 'pi pi-chart-bar',
        changePercent: this.calcChange(s?.averagePerOrder, p?.averagePerOrder),
      },
    ];
  }

  get kitchenCards() {
    const icons: Record<number, string> = { 1: 'pi pi-sun', 2: 'pi pi-box', 3: 'pi pi-heart' };
    const colors: Record<number, string> = { 1: 'text-primary', 2: 'text-success', 3: 'text-warning' };
    const bgColors: Record<number, string> = { 1: 'bg-primary/10', 2: 'bg-success/10', 3: 'bg-warning/10' };
    return (this.overview()?.kitchenBreakdown ?? []).map((k) => ({
      categoryName: k.categoryName ?? '',
      itemCount: k.itemCount ?? 0,
      icon: icons[k.categoryType ?? 0] ?? 'pi pi-circle',
      color: colors[k.categoryType ?? 0] ?? '',
      bgColor: bgColors[k.categoryType ?? 0] ?? 'bg-surface',
    }));
  }

  // ─── Private ──────────────────────────────────────────

  private loadAllData(): void {
    this.loadOverview();
    this.loadTopSelling();
    this.loadPeakHours();
  }

  private loadOverview(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    this.dashboardService
      .dashboardGetOverviewGet({ date: dateStr, days: this.trendDays })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.overview.set(res.result ?? null);
          this.updateRevenueTrendChart();
        },
      });
  }

  private loadTopSelling(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    this.dashboardService
      .dashboardGetTopSellingGet({ date: dateStr, days: 30 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.topSelling.set(res.result ?? null);
          this.updateTopSellingCharts();
        },
      });
  }

  private loadPeakHours(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    this.dashboardService
      .dashboardGetPeakHoursGet({ date: dateStr })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.peakHours.set(res.result ?? null);
          this.updatePeakHoursChart();
        },
      });
  }

  private updateRevenueTrendChart(): void {
    const trend = this.overview()?.revenueTrend ?? [];
    this.revenueTrendData.set({
      labels: trend.map((t) => this.formatDateLabel(t.date!)),
      datasets: [
        {
          data: trend.map((t) => t.totalSales ?? 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#f97316',
        },
      ],
    });
  }

  private updateTopSellingCharts(): void {
    const ts = this.topSelling();
    this.foodChartData.set(this.buildBarData(ts?.food ?? [], '#f97316'));
    this.beverageChartData.set(this.buildBarData(ts?.beverage ?? [], '#14b8a6'));
    this.dessertChartData.set(this.buildBarData(ts?.dessert ?? [], '#fbbf24'));
  }

  private updatePeakHoursChart(): void {
    const hours = this.peakHours()?.hours ?? [];
    const maxCount = Math.max(...hours.map((h) => h.orderCount ?? 0), 0);
    this.peakHoursData.set({
      labels: hours.map((h) => `${h.hour}:00`),
      datasets: [
        {
          data: hours.map((h) => h.orderCount ?? 0),
          backgroundColor: hours.map((h) =>
            (h.orderCount ?? 0) === maxCount && maxCount > 0
              ? '#ea580c'
              : '#f97316',
          ),
          borderRadius: 4,
        },
      ],
    });
  }

  private buildBarData(
    items: { menuName?: string | null; totalQuantity?: number }[],
    color: string,
  ): ChartData<'bar'> {
    return {
      labels: items.map((i) => i.menuName ?? ''),
      datasets: [
        {
          data: items.map((i) => i.totalQuantity ?? 0),
          backgroundColor: color,
          borderRadius: 4,
        },
      ],
    };
  }

  private calcChange(
    current?: number,
    previous?: number,
  ): number | null {
    if (!previous || previous === 0) return null;
    return Math.round(((current ?? 0) - previous) / previous * 1000) / 10;
  }

  private formatCurrency(value: number): string {
    return '฿' + value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatDateParam(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}
