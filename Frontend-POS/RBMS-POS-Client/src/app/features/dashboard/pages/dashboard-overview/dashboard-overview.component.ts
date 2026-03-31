import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { DailyBreakdownModel } from '@app/core/api/models/daily-breakdown-model';
import { DashboardKpiModel } from '@app/core/api/models/dashboard-kpi-model';
import { DashboardOverviewResponseModel } from '@app/core/api/models/dashboard-overview-response-model';
import { HourlyOrderModel } from '@app/core/api/models/hourly-order-model';
import { KitchenBreakdownModel } from '@app/core/api/models/kitchen-breakdown-model';
import { RevenueTrendModel } from '@app/core/api/models/revenue-trend-model';
import { TopSellingItemModel } from '@app/core/api/models/top-selling-item-model';
import { TopSellingResponseModel } from '@app/core/api/models/top-selling-response-model';
import { DashboardService } from '@app/core/api/services/dashboard.service';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';

const KEY_BTN_REFRESH = 'refresh-dashboard';
const USE_MOCK = true;
const PLACEHOLDER_IMAGE =
  'https://placehold.co/120x120/e2e8f0/94a3b8?text=No+Img';

@Component({
  selector: 'app-dashboard-overview',
  standalone: false,
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  today: Date = new Date();
  trendDays: 7 | 30 = 7;
  periodDays: 7 | 30 = 7;

  revenueTrendData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  revenueTrendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 16 } } },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 16 },
          callback: (v) => '฿' + Number(v).toLocaleString(),
        },
      },
    },
  };

  // Period comparison
  hasTwoPeriods = signal(false);
  period1Label = '';
  period2Label = '';
  periodComparisonData = signal<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });
  periodComparisonOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 16 },
        },
      },
    },
    scales: {
      x: { ticks: { font: { size: 16 } } },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 16 },
          callback: (v) => '฿' + Number(v).toLocaleString(),
        },
      },
    },
  };

  kpiCards: KpiCardItem[] = [];
  kitchenItems: KitchenItem[] = [];
  topSellingFood: TopSellingItem[] = [];
  topSellingBeverage: TopSellingItem[] = [];
  topSellingDessert: TopSellingItem[] = [];
  peakHours: PeakHourItem[] = [];

  constructor(
    private dashboardService: DashboardService,
    private breadcrumbService: BreadcrumbService,
    private apiConfig: ApiConfiguration,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_REFRESH,
      type: 'button',
      item: {
        key: KEY_BTN_REFRESH,
        label: 'Refresh',
        severity: 'primary',
        callback: () => this.onRefresh(),
      },
    });

    if (USE_MOCK) {
      this.loadMockData();
    } else {
      this.loadDashboard();
    }
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  onDateChange(): void {
    if (USE_MOCK) return;
    this.loadDashboard();
  }

  onTrendToggle(days: 7 | 30): void {
    this.trendDays = days;
    if (USE_MOCK) {
      this.buildRevenueTrendMock();
    } else {
      this.loadOverviewOnly();
    }
  }

  onPeriodToggle(days: 7 | 30): void {
    this.periodDays = days;
    if (USE_MOCK) {
      this.buildPeriodComparisonMock();
    } else {
      this.loadPeriodOnly();
    }
  }

  onRefresh(): void {
    if (USE_MOCK) {
      this.loadMockData();
    } else {
      this.loadDashboard();
    }
  }

  // ─── API Mode ─────────────────────────────────────

  private loadDashboard(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    const sparklineFrom = new Date(this.selectedDate);
    sparklineFrom.setDate(sparklineFrom.getDate() - 6);

    forkJoin({
      overview: this.dashboardService.dashboardGetOverviewGet({
        date: dateStr,
        days: this.trendDays,
      }),
      salesReport: this.dashboardService.dashboardGetSalesReportGet({
        from: this.formatDateParam(sparklineFrom),
        to: dateStr,
      }),
      topSelling: this.dashboardService.dashboardGetTopSellingGet({
        date: dateStr,
      }),
      peakHours: this.dashboardService.dashboardGetPeakHoursGet({
        date: dateStr,
      }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ overview, salesReport, topSelling, peakHours }) => {
          const ov = overview.result;
          const daily = salesReport.result?.dailyBreakdown ?? [];
          if (ov) {
            this.transformKpi(ov.selected, ov.previous, daily);
            this.transformKitchen(ov.kitchenBreakdown ?? []);
            this.buildRevenueTrendFromApi(ov.revenueTrend ?? []);
            this.buildPeriodComparisonFromApi(ov);
          }
          this.transformTopSelling(topSelling.result);
          this.transformPeakHours(peakHours.result?.hours ?? []);
        },
      });
  }

  private loadOverviewOnly(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    this.dashboardService
      .dashboardGetOverviewGet({ date: dateStr, days: this.trendDays })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.buildRevenueTrendFromApi(res.result.revenueTrend ?? []);
          }
        },
      });
  }

  private loadPeriodOnly(): void {
    const dateStr = this.formatDateParam(this.selectedDate);
    this.dashboardService
      .dashboardGetOverviewGet({ date: dateStr, days: this.periodDays })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.buildPeriodComparisonFromApi(res.result);
          }
        },
      });
  }

  private transformKpi(
    selected?: DashboardKpiModel,
    previous?: DashboardKpiModel,
    dailyBreakdown?: DailyBreakdownModel[],
  ): void {
    if (!selected) {
      this.kpiCards = [];
      return;
    }

    // dailyBreakdown เรียง date DESC จาก API → reverse ให้เก่า→ใหม่ สำหรับ sparkline
    const daily = [...(dailyBreakdown ?? [])].reverse();
    const spark = (field: keyof DailyBreakdownModel): number[] =>
      daily.map((d) => (d[field] as number) ?? 0);

    this.kpiCards = [
      {
        label: 'ยอดขาย',
        value: this.formatCurrency(selected.totalSales ?? 0),
        icon: 'coin',
        accentColor: 'primary',
        changePercent: this.calcChange(
          selected.totalSales,
          previous?.totalSales,
        ),
        sparklineType: 'background',
        sparklineData: spark('totalSales'),
        comparisonStyle: 'bold',
      },
      {
        label: 'จำนวนออเดอร์',
        value: (selected.orderCount ?? 0).toLocaleString(),
        icon: 'bill-rastaurant',
        accentColor: 'info',
        changePercent: this.calcChange(
          selected.orderCount,
          previous?.orderCount,
        ),
        sparklineType: 'background',
        sparklineData: spark('orderCount'),
        comparisonStyle: 'bold',
      },
      {
        label: 'จำนวนลูกค้า',
        value: (selected.guestCount ?? 0).toLocaleString(),
        icon: 'people-rate',
        accentColor: 'success',
        changePercent: this.calcChange(
          selected.guestCount,
          previous?.guestCount,
        ),
        sparklineType: 'background',
        sparklineData: spark('guestCount'),
        comparisonStyle: 'bold',
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(selected.averagePerOrder ?? 0),
        icon: 'cash-inflow',
        accentColor: 'warning',
        changePercent: this.calcChange(
          selected.averagePerOrder,
          previous?.averagePerOrder,
        ),
        sparklineType: 'background',
        sparklineData: spark('averagePerOrder'),
        comparisonStyle: 'bold',
      },
      {
        label: 'กำไรขั้นต้น',
        value: this.formatCurrency(selected.grossProfit ?? 0),
        icon: 'cash-balance',
        accentColor: 'success',
        changePercent: this.calcChange(
          selected.grossProfit,
          previous?.grossProfit,
        ),
        sparklineType: 'background',
        sparklineData: spark('grossProfit'),
        comparisonStyle: 'bold',
      },
      {
        label: '%กำไร',
        value: (selected.grossMarginPercent ?? 0).toFixed(1) + '%',
        icon: 'cash-pie',
        accentColor: 'danger',
        changePercent: this.calcChange(
          selected.grossMarginPercent,
          previous?.grossMarginPercent,
        ),
        sparklineType: 'background',
        sparklineData: spark('grossProfit'),
        comparisonStyle: 'bold',
      },
    ];
  }

  private transformKitchen(breakdown: KitchenBreakdownModel[]): void {
    const cfg: Record<
      number,
      { icon: string; color: string; bgClass: string; textClass: string }
    > = {
      1: { icon: 'food', color: '#f97316', bgClass: 'bg-cat-food-bg', textClass: 'text-cat-food' },
      2: { icon: 'drinks-glass', color: '#0EA5E9', bgClass: 'bg-cat-drink-bg', textClass: 'text-cat-drink' },
      3: { icon: 'dessert', color: '#EC4899', bgClass: 'bg-cat-dessert-bg', textClass: 'text-cat-dessert' },
    };
    const totalItems = breakdown.reduce((sum, b) => sum + (b.itemCount ?? 0), 0);
    this.kitchenItems = breakdown.map((b) => {
      const c = cfg[b.categoryType ?? 0] ?? cfg[1];
      const count = b.itemCount ?? 0;
      return {
        label: b.categoryName ?? '',
        count,
        percentage: totalItems > 0 ? (count / totalItems) * 100 : 0,
        icon: c.icon,
        color: c.color,
        bgClass: c.bgClass,
        textClass: c.textClass,
      };
    });
  }

  get kitchenTotal(): number {
    return this.kitchenItems.reduce((sum, item) => sum + item.count, 0);
  }

  get donutSegments(): { offset: number; length: number; color: string }[] {
    const circumference = 2 * Math.PI * 70;
    let offset = 0;
    return this.kitchenItems.map((item) => {
      const length = (item.percentage / 100) * circumference;
      const segment = { offset, length, color: item.color };
      offset += length;
      return segment;
    });
  }

  private buildRevenueTrendFromApi(trend: RevenueTrendModel[]): void {
    const labels = trend.map((t) => {
      const d = new Date(t.date ?? '');
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const data = trend.map((t) => t.totalSales ?? 0);

    this.revenueTrendData.set({
      labels,
      datasets: [
        {
          data,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: this.trendDays <= 7 ? 4 : 2,
          pointBackgroundColor: '#f97316',
        },
      ],
    });
  }

  private buildPeriodComparisonFromApi(
    ov: DashboardOverviewResponseModel,
  ): void {
    this.hasTwoPeriods.set(ov.hasTwoPeriods ?? false);
    this.period1Label = ov.period1Label ?? 'ช่วงที่ 1';
    this.period2Label = ov.period2Label ?? 'ช่วงที่ 2';

    const trend = ov.periodRevenueTrend ?? [];
    if (!ov.hasTwoPeriods || trend.length === 0) return;

    const labels = trend.map((t) => {
      const d = new Date(t.date ?? '');
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    this.periodComparisonData.set({
      labels,
      datasets: [
        {
          label: this.period1Label,
          data: trend.map((t) => t.period1Sales ?? 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: this.periodDays <= 7 ? 4 : 2,
          pointBackgroundColor: '#f97316',
        },
        {
          label: this.period2Label,
          data: trend.map((t) => t.period2Sales ?? 0),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: this.periodDays <= 7 ? 4 : 2,
          pointBackgroundColor: '#0ea5e9',
        },
      ],
    });
  }

  private transformTopSelling(result?: TopSellingResponseModel | null): void {
    this.topSellingFood = this.mapTopSellingItems(result?.food ?? []);
    this.topSellingBeverage = this.mapTopSellingItems(result?.beverage ?? []);
    this.topSellingDessert = this.mapTopSellingItems(result?.dessert ?? []);
  }

  private mapTopSellingItems(items: TopSellingItemModel[]): TopSellingItem[] {
    return items.map((item, i) => ({
      rank: i + 1,
      name: item.menuName ?? '',
      qty: item.totalQuantity ?? 0,
      image: item.imageFileId
        ? `${this.apiConfig.rootUrl}/api/admin/file/${item.imageFileId}`
        : PLACEHOLDER_IMAGE,
    }));
  }

  private transformPeakHours(hours: HourlyOrderModel[]): void {
    if (hours.length === 0) {
      this.peakHours = [];
      return;
    }
    const maxCount = Math.max(...hours.map((h) => h.orderCount ?? 0));
    const peakThreshold = maxCount * 0.8;
    this.peakHours = hours.map((h) => ({
      hour: h.hour ?? 0,
      label: `${h.hour ?? 0}:00`,
      count: h.orderCount ?? 0,
      heightPercent:
        maxCount > 0 ? Math.max(((h.orderCount ?? 0) / maxCount) * 85, 5) : 5,
      isPeak: (h.orderCount ?? 0) >= peakThreshold,
    }));
  }

  private calcChange(current?: number, previous?: number): number | null {
    if (current == null || previous == null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  private formatCurrency(value: number): string {
    return (
      value.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' บาท'
    );
  }

  private formatDateParam(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ─── Mock Mode ─────────────────────────────────────

  private loadMockData(): void {
    this.kpiCards = MOCK_KPI_CARDS;
    this.kitchenItems = MOCK_KITCHEN_ITEMS;
    this.topSellingFood = MOCK_TOP_FOOD;
    this.topSellingBeverage = MOCK_TOP_BEVERAGE;
    this.topSellingDessert = MOCK_TOP_DESSERT;
    this.buildRevenueTrendMock();
    this.buildPeakHoursMock();

    // Mock period comparison (สมมติร้านเปิด 2 ช่วง)
    this.hasTwoPeriods.set(true);
    this.period1Label = 'ช่วงที่ 1 (10:00-14:00)';
    this.period2Label = 'ช่วงที่ 2 (17:00-22:00)';
    this.buildPeriodComparisonMock();
  }

  private buildRevenueTrendMock(): void {
    const today = new Date();
    const days = this.trendDays;
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      data.push(Math.floor(8000 + Math.random() * 32000));
    }

    this.revenueTrendData.set({
      labels,
      datasets: [
        {
          data,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: days <= 7 ? 4 : 2,
          pointBackgroundColor: '#f97316',
        },
      ],
    });
  }

  private buildPeakHoursMock(): void {
    const raw = [
      { hour: 10, count: 5 },
      { hour: 11, count: 18 },
      { hour: 12, count: 42 },
      { hour: 13, count: 35 },
      { hour: 14, count: 12 },
      { hour: 15, count: 8 },
      { hour: 16, count: 10 },
      { hour: 17, count: 22 },
      { hour: 18, count: 48 },
      { hour: 19, count: 52 },
      { hour: 20, count: 38 },
      { hour: 21, count: 15 },
    ];
    const maxCount = Math.max(...raw.map((h) => h.count));
    const peakThreshold = maxCount * 0.8;
    this.peakHours = raw.map((h) => ({
      hour: h.hour,
      label: `${h.hour}:00`,
      count: h.count,
      heightPercent: Math.max((h.count / maxCount) * 85, 5),
      isPeak: h.count >= peakThreshold,
    }));
  }

  private buildPeriodComparisonMock(): void {
    const today = new Date();
    const days = this.periodDays;
    const labels: string[] = [];
    const period1: number[] = [];
    const period2: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      period1.push(Math.floor(3000 + Math.random() * 15000));
      period2.push(Math.floor(5000 + Math.random() * 25000));
    }

    this.periodComparisonData.set({
      labels,
      datasets: [
        {
          label: this.period1Label,
          data: period1,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: days <= 7 ? 4 : 2,
          pointBackgroundColor: '#f97316',
        },
        {
          label: this.period2Label,
          data: period2,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: days <= 7 ? 4 : 2,
          pointBackgroundColor: '#0ea5e9',
        },
      ],
    });
  }
}

// ─── Mock Data ────────────────────────────────────────

const MOCK_KPI_CARDS: KpiCardItem[] = [
  {
    label: 'ยอดขาย',
    value: '34,500.00 บาท',
    icon: 'coin',
    accentColor: 'primary',
    changePercent: 12.5,
    sparklineType: 'background',
    sparklineData: [28000, 31000, 27500, 34500, 29000, 32000, 34500],
    comparisonStyle: 'bold',
  },
  {
    label: 'จำนวนออเดอร์',
    value: '52',
    icon: 'bill-rastaurant',
    accentColor: 'info',
    changePercent: 8.3,
    sparklineType: 'background',
    sparklineData: [42, 38, 45, 50, 47, 55, 52],
    comparisonStyle: 'bold',
  },
  {
    label: 'จำนวนลูกค้า',
    value: '128',
    icon: 'people-rate',
    accentColor: 'success',
    changePercent: -3.2,
    sparklineType: 'background',
    sparklineData: [135, 142, 120, 138, 125, 130, 128],
    comparisonStyle: 'bold',
  },
  {
    label: 'เฉลี่ย/ออเดอร์',
    value: '663.46 บาท',
    icon: 'cash-inflow',
    accentColor: 'warning',
    changePercent: 4.1,
    sparklineType: 'background',
    sparklineData: [580, 620, 650, 610, 680, 640, 663],
    comparisonStyle: 'bold',
  },
  {
    label: 'กำไรขั้นต้น',
    value: '12,075.00 บาท',
    icon: 'cash-balance',
    accentColor: 'success',
    changePercent: 15.2,
    sparklineType: 'background',
    sparklineData: [9800, 10500, 9200, 11800, 10200, 11500, 12075],
    comparisonStyle: 'bold',
  },
  {
    label: '%กำไร',
    value: '35.0%',
    icon: 'cash-pie',
    accentColor: 'danger',
    changePercent: -2.1,
    sparklineType: 'background',
    sparklineData: [32, 33.5, 31, 34, 33, 35.5, 35],
    comparisonStyle: 'bold',
  },
];

const MOCK_KITCHEN_ITEMS: KitchenItem[] = [
  { label: 'อาหาร', count: 527, percentage: 33.8, icon: 'food', color: '#f97316', bgClass: 'bg-cat-food-bg', textClass: 'text-cat-food' },
  { label: 'เครื่องดื่ม', count: 711, percentage: 45.6, icon: 'drinks-glass', color: '#0EA5E9', bgClass: 'bg-cat-drink-bg', textClass: 'text-cat-drink' },
  { label: 'ของหวาน', count: 320, percentage: 20.6, icon: 'dessert', color: '#EC4899', bgClass: 'bg-cat-dessert-bg', textClass: 'text-cat-dessert' },
];

const MOCK_TOP_FOOD: TopSellingItem[] = [
  {
    rank: 1,
    name: 'ผัดกะเพราหมูสับ',
    qty: 145,
    image: 'https://placehold.co/120x120/f97316/white?text=1',
  },
  {
    rank: 2,
    name: 'ข้าวมันไก่',
    qty: 128,
    image: 'https://placehold.co/120x120/fb923c/white?text=2',
  },
  {
    rank: 3,
    name: 'ต้มยำกุ้ง',
    qty: 97,
    image: 'https://placehold.co/120x120/fdba74/white?text=3',
  },
  {
    rank: 4,
    name: 'ส้มตำไทย',
    qty: 85,
    image: 'https://placehold.co/120x120/fed7aa/333?text=4',
  },
  {
    rank: 5,
    name: 'แกงเขียวหวาน',
    qty: 72,
    image: 'https://placehold.co/120x120/ffedd5/333?text=5',
  },
];

const MOCK_TOP_BEVERAGE: TopSellingItem[] = [
  {
    rank: 1,
    name: 'ชาเย็น',
    qty: 210,
    image: 'https://placehold.co/120x120/0EA5E9/white?text=1',
  },
  {
    rank: 2,
    name: 'กาแฟเย็น',
    qty: 185,
    image: 'https://placehold.co/120x120/38bdf8/white?text=2',
  },
  {
    rank: 3,
    name: 'น้ำมะนาว',
    qty: 142,
    image: 'https://placehold.co/120x120/7dd3fc/white?text=3',
  },
  {
    rank: 4,
    name: 'โกโก้เย็น',
    qty: 98,
    image: 'https://placehold.co/120x120/bae6fd/333?text=4',
  },
  {
    rank: 5,
    name: 'ชาเขียว',
    qty: 76,
    image: 'https://placehold.co/120x120/e0f2fe/333?text=5',
  },
];

const MOCK_TOP_DESSERT: TopSellingItem[] = [
  {
    rank: 1,
    name: 'ไอศกรีมกะทิ',
    qty: 88,
    image: 'https://placehold.co/120x120/EC4899/white?text=1',
  },
  {
    rank: 2,
    name: 'บัวลอย',
    qty: 72,
    image: 'https://placehold.co/120x120/f472b6/white?text=2',
  },
  {
    rank: 3,
    name: 'ขนมปังปิ้ง',
    qty: 65,
    image: 'https://placehold.co/120x120/f9a8d4/333?text=3',
  },
  {
    rank: 4,
    name: 'เครปเค้ก',
    qty: 54,
    image: 'https://placehold.co/120x120/fbcfe8/333?text=4',
  },
  {
    rank: 5,
    name: 'ทับทิมกรอบ',
    qty: 41,
    image: 'https://placehold.co/120x120/fce7f3/333?text=5',
  },
];

// ─── Local Interfaces ─────────────────────────────────

interface KpiCardItem {
  label: string;
  value: string;
  icon: string;
  accentColor: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  changePercent: number | null;
  sparklineData?: number[];
  sparklineType?: 'bottom' | 'right' | 'background' | 'none';
  comparisonStyle?: 'default' | 'circle' | 'below' | 'bold';
}

interface TopSellingItem {
  rank: number;
  name: string;
  qty: number;
  image: string;
}

interface PeakHourItem {
  hour: number;
  label: string;
  count: number;
  heightPercent: number;
  isPeak: boolean;
}

interface KitchenItem {
  label: string;
  count: number;
  percentage: number;
  icon: string;
  color: string;
  bgClass: string;
  textClass: string;
}
