import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiConfiguration } from '@app/core/api/api-configuration';
import { DashboardKpiModel } from '@app/core/api/models/dashboard-kpi-model';
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
const PLACEHOLDER_IMAGE = 'https://placehold.co/120x120/e2e8f0/94a3b8?text=No+Img';

@Component({
  selector: 'app-dashboard-overview',
  standalone: false,
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  trendDays: 7 | 30 = 7;

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

  kpiCards: KpiCardItem[] = [];
  kitchenCards: KitchenCardItem[] = [];
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

    forkJoin({
      overview: this.dashboardService.dashboardGetOverviewGet({ date: dateStr, days: this.trendDays }),
      topSelling: this.dashboardService.dashboardGetTopSellingGet({ date: dateStr }),
      peakHours: this.dashboardService.dashboardGetPeakHoursGet({ date: dateStr }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ overview, topSelling, peakHours }) => {
          const ov = overview.result;
          if (ov) {
            this.transformKpi(ov.selected, ov.previous);
            this.transformKitchen(ov.kitchenBreakdown ?? []);
            this.buildRevenueTrendFromApi(ov.revenueTrend ?? []);
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

  private transformKpi(selected?: DashboardKpiModel, previous?: DashboardKpiModel): void {
    if (!selected) {
      this.kpiCards = [];
      return;
    }
    this.kpiCards = [
      {
        label: 'ยอดขาย',
        value: this.formatCurrency(selected.totalSales ?? 0),
        icon: 'coin',
        accentColor: 'primary',
        changePercent: this.calcChange(selected.totalSales, previous?.totalSales),
      },
      {
        label: 'จำนวนออเดอร์',
        value: (selected.orderCount ?? 0).toLocaleString(),
        icon: 'bill-rastaurant',
        accentColor: 'info',
        changePercent: this.calcChange(selected.orderCount, previous?.orderCount),
      },
      {
        label: 'จำนวนลูกค้า',
        value: (selected.guestCount ?? 0).toLocaleString(),
        icon: 'people-rate',
        accentColor: 'success',
        changePercent: this.calcChange(selected.guestCount, previous?.guestCount),
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(selected.averagePerOrder ?? 0),
        icon: 'cash-inflow',
        accentColor: 'warning',
        changePercent: null,
      },
    ];
  }

  private transformKitchen(breakdown: KitchenBreakdownModel[]): void {
    const cfg: Record<number, { iconName: string; color: string; bgStyle: string; borderColor: string }> = {
      1: { iconName: 'food', color: 'text-cat-food', bgStyle: 'rgba(249, 115, 22, 0.1)', borderColor: 'border-cat-food' },
      2: { iconName: 'drinks-glass', color: 'text-cat-drink', bgStyle: 'rgba(14, 165, 233, 0.1)', borderColor: 'border-cat-drink' },
      3: { iconName: 'dessert', color: 'text-cat-dessert', bgStyle: 'rgba(236, 72, 153, 0.1)', borderColor: 'border-cat-dessert' },
    };
    this.kitchenCards = breakdown.map((b) => {
      const c = cfg[b.categoryType ?? 0] ?? cfg[1];
      return {
        categoryName: b.categoryName ?? '',
        itemCount: b.itemCount ?? 0,
        iconName: c.iconName,
        color: c.color,
        bgStyle: c.bgStyle,
        borderColor: c.borderColor,
        percent: b.percentage ?? 0,
      };
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
      heightPercent: maxCount > 0 ? Math.max(((h.orderCount ?? 0) / maxCount) * 85, 5) : 5,
      isPeak: (h.orderCount ?? 0) >= peakThreshold,
    }));
  }

  private calcChange(current?: number, previous?: number): number | null {
    if (current == null || previous == null || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }

  private formatCurrency(value: number): string {
    return '฿' + value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    this.kitchenCards = MOCK_KITCHEN_CARDS;
    this.topSellingFood = MOCK_TOP_FOOD;
    this.topSellingBeverage = MOCK_TOP_BEVERAGE;
    this.topSellingDessert = MOCK_TOP_DESSERT;
    this.buildRevenueTrendMock();
    this.buildPeakHoursMock();
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
}

// ─── Mock Data ────────────────────────────────────────

const MOCK_KPI_CARDS: KpiCardItem[] = [
  { label: 'ยอดขาย', value: '฿34,500.00', icon: 'coin', accentColor: 'primary', changePercent: 12.5 },
  { label: 'จำนวนออเดอร์', value: '52', icon: 'bill-rastaurant', accentColor: 'info', changePercent: 8.3 },
  { label: 'จำนวนลูกค้า', value: '128', icon: 'people-rate', accentColor: 'success', changePercent: -3.2 },
  { label: 'เฉลี่ย/ออเดอร์', value: '฿663.46', icon: 'cash-inflow', accentColor: 'warning', changePercent: null },
];

const MOCK_KITCHEN_CARDS: KitchenCardItem[] = [
  { categoryName: 'อาหาร', itemCount: 527, iconName: 'food', color: 'text-cat-food', bgStyle: 'rgba(249, 115, 22, 0.1)', borderColor: 'border-cat-food', percent: 33.8 },
  { categoryName: 'เครื่องดื่ม', itemCount: 711, iconName: 'drinks-glass', color: 'text-cat-drink', bgStyle: 'rgba(14, 165, 233, 0.1)', borderColor: 'border-cat-drink', percent: 45.6 },
  { categoryName: 'ของหวาน', itemCount: 320, iconName: 'dessert', color: 'text-cat-dessert', bgStyle: 'rgba(236, 72, 153, 0.1)', borderColor: 'border-cat-dessert', percent: 20.6 },
];

const MOCK_TOP_FOOD: TopSellingItem[] = [
  { rank: 1, name: 'ผัดกะเพราหมูสับ', qty: 145, image: 'https://placehold.co/120x120/f97316/white?text=1' },
  { rank: 2, name: 'ข้าวมันไก่', qty: 128, image: 'https://placehold.co/120x120/fb923c/white?text=2' },
  { rank: 3, name: 'ต้มยำกุ้ง', qty: 97, image: 'https://placehold.co/120x120/fdba74/white?text=3' },
  { rank: 4, name: 'ส้มตำไทย', qty: 85, image: 'https://placehold.co/120x120/fed7aa/333?text=4' },
  { rank: 5, name: 'แกงเขียวหวาน', qty: 72, image: 'https://placehold.co/120x120/ffedd5/333?text=5' },
];

const MOCK_TOP_BEVERAGE: TopSellingItem[] = [
  { rank: 1, name: 'ชาเย็น', qty: 210, image: 'https://placehold.co/120x120/0EA5E9/white?text=1' },
  { rank: 2, name: 'กาแฟเย็น', qty: 185, image: 'https://placehold.co/120x120/38bdf8/white?text=2' },
  { rank: 3, name: 'น้ำมะนาว', qty: 142, image: 'https://placehold.co/120x120/7dd3fc/white?text=3' },
  { rank: 4, name: 'โกโก้เย็น', qty: 98, image: 'https://placehold.co/120x120/bae6fd/333?text=4' },
  { rank: 5, name: 'ชาเขียว', qty: 76, image: 'https://placehold.co/120x120/e0f2fe/333?text=5' },
];

const MOCK_TOP_DESSERT: TopSellingItem[] = [
  { rank: 1, name: 'ไอศกรีมกะทิ', qty: 88, image: 'https://placehold.co/120x120/EC4899/white?text=1' },
  { rank: 2, name: 'บัวลอย', qty: 72, image: 'https://placehold.co/120x120/f472b6/white?text=2' },
  { rank: 3, name: 'ขนมปังปิ้ง', qty: 65, image: 'https://placehold.co/120x120/f9a8d4/333?text=3' },
  { rank: 4, name: 'เครปเค้ก', qty: 54, image: 'https://placehold.co/120x120/fbcfe8/333?text=4' },
  { rank: 5, name: 'ทับทิมกรอบ', qty: 41, image: 'https://placehold.co/120x120/fce7f3/333?text=5' },
];

// ─── Local Interfaces ─────────────────────────────────

interface KpiCardItem {
  label: string;
  value: string;
  icon: string;
  accentColor: 'primary' | 'success' | 'warning' | 'info';
  changePercent: number | null;
}

interface KitchenCardItem {
  categoryName: string;
  itemCount: number;
  iconName: string;
  color: string;
  bgStyle: string;
  borderColor: string;
  percent: number;
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
