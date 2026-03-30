import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '@app/core/api/services/dashboard.service';
import { SalesReportResponseModel } from '@app/core/api/models/sales-report-response-model';
import { DailyBreakdownModel } from '@app/core/api/models/daily-breakdown-model';
import { ModalService } from '@app/core/services/modal.service';
import { ChartData, ChartOptions } from 'chart.js';

const USE_MOCK = true;

const CATEGORY_CONFIG: Record<number, { iconName: string; color: string; bgStyle: string; borderColor: string }> = {
  1: { iconName: 'food', color: 'text-cat-food', bgStyle: 'rgba(249, 115, 22, 0.1)', borderColor: 'border-cat-food' },
  2: { iconName: 'drinks-glass', color: 'text-cat-drink', bgStyle: 'rgba(14, 165, 233, 0.1)', borderColor: 'border-cat-drink' },
  3: { iconName: 'dessert', color: 'text-cat-dessert', bgStyle: 'rgba(236, 72, 153, 0.1)', borderColor: 'border-cat-dessert' },
};

const PIE_COLORS: Record<number, string> = { 1: '#f97316', 2: '#0EA5E9', 3: '#EC4899' };

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
        icon: 'coin',
        accentColor: 'primary' as const,
      },
      {
        label: 'จำนวนออเดอร์',
        value: (s?.orderCount ?? 0).toLocaleString(),
        icon: 'bill-rastaurant',
        accentColor: 'info' as const,
      },
      {
        label: 'จำนวนลูกค้า',
        value: (s?.guestCount ?? 0).toLocaleString(),
        icon: 'people-rate',
        accentColor: 'success' as const,
      },
      {
        label: 'เฉลี่ย/ออเดอร์',
        value: this.formatCurrency(s?.averagePerOrder ?? 0),
        icon: 'cash-inflow',
        accentColor: 'warning' as const,
      },
    ];
  }

  get kitchenItems() {
    return (this.report()?.kitchenBreakdown ?? []).map((k) => {
      const c = CATEGORY_CONFIG[k.categoryType ?? 0] ?? CATEGORY_CONFIG[1];
      return {
        categoryName: k.categoryName ?? '',
        itemCount: k.itemCount ?? 0,
        percentage: k.percentage ?? 0,
        iconName: c.iconName,
        color: c.color,
        bgStyle: c.bgStyle,
        borderColor: c.borderColor,
      };
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
    return '฿' + value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ─── Private ──────────────────────────────────────────

  private loadReport(): void {
    if (USE_MOCK) {
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
    return date.toISOString().split('T')[0];
  }

  // ─── Mock ─────────────────────────────────────────────

  private loadMockReport(): void {
    const today = new Date();
    const daily: DailyBreakdownModel[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const sales = 20000 + Math.floor(Math.random() * 25000);
      const orders = 30 + Math.floor(Math.random() * 40);
      const guests = orders * 2 + Math.floor(Math.random() * 30);
      daily.push({
        date: d.toISOString().split('T')[0],
        totalSales: sales,
        orderCount: orders,
        guestCount: guests,
        averagePerOrder: Math.round((sales / orders) * 100) / 100,
      });
    }

    this.report.set({
      summary: {
        totalSales: 245000,
        orderCount: 387,
        guestCount: 892,
        averagePerOrder: 633.07,
      },
      kitchenBreakdown: [
        { categoryName: 'อาหาร', categoryType: 1, itemCount: 527, percentage: 33.8 },
        { categoryName: 'เครื่องดื่ม', categoryType: 2, itemCount: 711, percentage: 45.6 },
        { categoryName: 'ของหวาน', categoryType: 3, itemCount: 320, percentage: 20.6 },
      ],
      categoryBreakdown: [
        { categoryName: 'อาหาร', categoryType: 1, totalSales: 98000, percentage: 40 },
        { categoryName: 'เครื่องดื่ม', categoryType: 2, totalSales: 105000, percentage: 42.9 },
        { categoryName: 'ของหวาน', categoryType: 3, totalSales: 42000, percentage: 17.1 },
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
