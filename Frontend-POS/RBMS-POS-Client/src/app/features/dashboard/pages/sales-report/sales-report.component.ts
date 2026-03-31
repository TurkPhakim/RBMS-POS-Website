import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '@app/core/api/services/dashboard.service';
import { SalesReportResponseModel } from '@app/core/api/models/sales-report-response-model';
import { DailyBreakdownModel } from '@app/core/api/models/daily-breakdown-model';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';
import { ModalService } from '@app/core/services/modal.service';
import { toLocalDateString } from '@app/shared/utils';
import { ChartData, ChartOptions } from 'chart.js';

const KEY_BTN_MOCK = 'toggle-mock-sales';

const CATEGORY_CONFIG: Record<number, { iconName: string; color: string; bgStyle: string; borderColor: string }> = {
  1: { iconName: 'chicken-drumstick', color: 'text-cat-food', bgStyle: 'rgba(249, 115, 22, 0.1)', borderColor: 'border-cat-food' },
  2: { iconName: 'drinks-glass', color: 'text-cat-drink', bgStyle: 'rgba(14, 165, 233, 0.1)', borderColor: 'border-cat-drink' },
  3: { iconName: 'dessert', color: 'text-cat-dessert', bgStyle: 'rgba(236, 72, 153, 0.1)', borderColor: 'border-cat-dessert' },
};

const PIE_COLORS: Record<number, string> = { 1: '#f97316', 2: '#0EA5E9', 3: '#EC4899' };

@Component({
  selector: 'app-sales-report',
  standalone: false,
  templateUrl: './sales-report.component.html',
})
export class SalesReportComponent implements OnInit, OnDestroy {
  report = signal<SalesReportResponseModel | null>(null);
  useMock = true;

  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  minEndDate = signal<Date | null>(null);
  activePreset: string | null = 'today';

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
    private breadcrumbService: BreadcrumbService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumbButtons();
    this.setPreset('month');
  }

  ngOnDestroy(): void {
    this.breadcrumbService.clearButtons();
  }

  toggleMock(): void {
    this.useMock = !this.useMock;
    this.updateMockButton();
    this.loadReport();
  }

  private setupBreadcrumbButtons(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_MOCK,
      type: 'button',
      item: {
        key: KEY_BTN_MOCK,
        label: 'Mock: ON',
        severity: 'success',
        callback: () => this.toggleMock(),
      },
    });
  }

  private updateMockButton(): void {
    this.breadcrumbService.addOrUpdateButton({
      key: KEY_BTN_MOCK,
      type: 'button',
      item: {
        key: KEY_BTN_MOCK,
        label: this.useMock ? 'Mock: ON' : 'Mock: OFF',
        severity: this.useMock ? 'success' : 'secondary',
        variant: this.useMock ? undefined : 'outlined',
        callback: () => this.toggleMock(),
      },
    });
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
        icon: 'coin',
        accentColor: 'primary' as const,
        unit: 'บาท',
      },
      {
        label: 'จำนวนออเดอร์',
        value: (s?.orderCount ?? 0).toLocaleString(),
        icon: 'bill-rastaurant',
        accentColor: 'info' as const,
        unit: 'บิล',
      },
      {
        label: 'จำนวนลูกค้า',
        value: (s?.guestCount ?? 0).toLocaleString(),
        icon: 'people-rate',
        accentColor: 'teal' as const,
        unit: 'คน',
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(s?.averagePerOrder ?? 0),
        icon: 'cash-inflow',
        accentColor: 'warning' as const,
        unit: 'บาท',
      },
    ];
  }

  get kitchenItems() {
    const cfg: Record<number, { icon: string; iconSize: string; color: string; bgClass: string; textClass: string }> = {
      1: { icon: 'chicken-drumstick', iconSize: 'w-8 h-8', color: '#f97316', bgClass: 'bg-cat-food-bg', textClass: 'text-cat-food' },
      2: { icon: 'drinks-glass', iconSize: 'w-6 h-6', color: '#0EA5E9', bgClass: 'bg-cat-drink-bg', textClass: 'text-cat-drink' },
      3: { icon: 'dessert', iconSize: 'w-8 h-8', color: '#EC4899', bgClass: 'bg-cat-dessert-bg', textClass: 'text-cat-dessert' },
    };
    return (this.report()?.kitchenBreakdown ?? []).map((k) => {
      const c = cfg[k.categoryType ?? 0] ?? cfg[1];
      return {
        label: k.categoryName ?? '',
        count: k.itemCount ?? 0,
        percentage: k.percentage ?? 0,
        icon: c.icon,
        iconSize: c.iconSize,
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

  get dailyBreakdown(): DailyBreakdownModel[] {
    return this.report()?.dailyBreakdown ?? [];
  }

  get hasPieData(): boolean {
    return (this.report()?.categoryBreakdown?.length ?? 0) > 0;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ─── Private ──────────────────────────────────────────

  private loadReport(): void {
    if (this.useMock) {
      this.loadMockReport();
      return;
    }
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
    this.categoryPieData.set({
      labels: cats.map((c) => c.categoryName ?? ''),
      datasets: [
        {
          data: cats.map((c) => c.totalSales ?? 0),
          backgroundColor: cats.map((c) => PIE_COLORS[c.categoryType ?? 0] ?? '#94a3b8'),
        },
      ],
    });
  }

  private formatDateParam(date: Date): string {
    return toLocalDateString(date).split('T')[0];
  }

  // ─── Mock ─────────────────────────────────────────────

  private loadMockReport(): void {
    const from = new Date(this.dateFrom);
    const to = new Date(this.dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    // Seed จาก dateFrom เพื่อให้ค่าคงที่เมื่อเลือกวันเดิม
    let seed = from.getTime() % 100000;
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const daily: DailyBreakdownModel[] = [];
    const current = new Date(from);
    let totalSales = 0;
    let totalOrders = 0;
    let totalGuests = 0;

    // Day-of-week multiplier (จันทร์ซึม → ศุกร์-เสาร์คึกคัก)
    const dayMultiplier: Record<number, number> = {
      0: 1.15, // อาทิตย์ — ค่อนข้างดี
      1: 0.75, // จันทร์ — ซึมสุด
      2: 0.85, // อังคาร
      3: 0.90, // พุธ
      4: 0.95, // พฤหัส
      5: 1.25, // ศุกร์ — คึกคัก
      6: 1.35, // เสาร์ — คึกคักสุด
    };

    while (current <= to) {
      const dow = current.getDay();
      const mult = dayMultiplier[dow];

      // วันพิเศษ spike ~10% ของวัน (เช่น มีงานเลี้ยง/โปรโมชั่น)
      const isSpecialDay = seededRandom() < 0.1;
      const specialBoost = isSpecialDay ? 1.4 + seededRandom() * 0.3 : 1.0;

      const baseSales = 28000;
      const baseOrders = 45;

      const sales = Math.round(baseSales * mult * specialBoost * (0.85 + seededRandom() * 0.30));
      const orders = Math.round(baseOrders * mult * specialBoost * (0.85 + seededRandom() * 0.30));
      const guestsPerOrder = 1.6 + seededRandom() * 1.0; // 1.6–2.6 คนต่อออเดอร์
      const guests = Math.round(orders * guestsPerOrder);

      daily.push({
        date: toLocalDateString(current).split('T')[0],
        totalSales: sales,
        orderCount: orders,
        guestCount: guests,
        averagePerOrder: Math.round((sales / (orders || 1)) * 100) / 100,
      });

      totalSales += sales;
      totalOrders += orders;
      totalGuests += guests;
      current.setDate(current.getDate() + 1);
    }

    // สัดส่วนหมวดหมู่ — ยอดขาย (บาท)
    const foodPct = 0.42 + seededRandom() * 0.06;  // 42-48%
    const drinkPct = 0.28 + seededRandom() * 0.06;  // 28-34%
    const dessertPct = 1 - foodPct - drinkPct;       // ส่วนที่เหลือ

    const foodSales = Math.round(totalSales * foodPct);
    const drinkSales = Math.round(totalSales * drinkPct);
    const dessertSales = totalSales - foodSales - drinkSales;

    // สัดส่วนหมวดหมู่ — จำนวนชิ้น
    const totalItems = Math.round(totalOrders * (3.2 + seededRandom() * 1.2)); // 3.2–4.4 ชิ้นต่อออเดอร์
    const foodItems = Math.round(totalItems * (0.30 + seededRandom() * 0.06));
    const drinkItems = Math.round(totalItems * (0.42 + seededRandom() * 0.06));
    const dessertItems = totalItems - foodItems - drinkItems;

    this.report.set({
      summary: {
        totalSales,
        orderCount: totalOrders,
        guestCount: totalGuests,
        averagePerOrder: Math.round((totalSales / (totalOrders || 1)) * 100) / 100,
      },
      kitchenBreakdown: [
        { categoryName: 'อาหาร', categoryType: 1, itemCount: foodItems, percentage: Math.round((foodItems / totalItems) * 1000) / 10 },
        { categoryName: 'เครื่องดื่ม', categoryType: 2, itemCount: drinkItems, percentage: Math.round((drinkItems / totalItems) * 1000) / 10 },
        { categoryName: 'ของหวาน', categoryType: 3, itemCount: dessertItems, percentage: Math.round((dessertItems / totalItems) * 1000) / 10 },
      ],
      categoryBreakdown: [
        { categoryName: 'อาหาร', categoryType: 1, totalSales: foodSales, percentage: Math.round((foodSales / totalSales) * 1000) / 10 },
        { categoryName: 'เครื่องดื่ม', categoryType: 2, totalSales: drinkSales, percentage: Math.round((drinkSales / totalSales) * 1000) / 10 },
        { categoryName: 'ของหวาน', categoryType: 3, totalSales: dessertSales, percentage: Math.round((dessertSales / totalSales) * 1000) / 10 },
      ],
      dailyBreakdown: daily,
    });
    this.updatePieChart();
  }
}

// ─── Date helpers ──────────────────────────────────────

function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? 6 : day - 1;
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
