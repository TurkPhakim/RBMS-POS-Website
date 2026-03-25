import { Component, OnInit, signal } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-test-sales-report',
  standalone: false,
  templateUrl: './test-sales-report.component.html',
})
export class TestSalesReportComponent implements OnInit {
  dateFrom: Date = new Date(2026, 2, 1); // 1 มี.ค. 2026
  dateTo: Date = new Date(2026, 2, 25); // 25 มี.ค. 2026
  minEndDate = signal<Date | null>(new Date(2026, 2, 1));
  activePreset: string | null = 'month';

  // Pie chart
  categoryPieData = signal<ChartData<'pie'>>({ labels: [], datasets: [] });
  categoryPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  // KPI + Kitchen + Daily
  kpiCards = MOCK_REPORT_KPI;
  kitchenItems = MOCK_KITCHEN_ITEMS;
  dailyBreakdown = MOCK_DAILY_BREAKDOWN;

  ngOnInit(): void {
    this.buildPieChart();
  }

  setPreset(preset: string): void {
    this.activePreset = preset;
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
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatCurrency(value: number): string {
    return (
      '฿' +
      value.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  private buildPieChart(): void {
    const colors = ['#f97316', '#14b8a6', '#fbbf24'];
    this.categoryPieData.set({
      labels: ['อาหาร', 'เครื่องดื่ม', 'ของหวาน'],
      datasets: [
        {
          data: [485200, 312800, 178500],
          backgroundColor: colors,
        },
      ],
    });
  }
}

// ─── Mock Data ────────────────────────────────────────

const MOCK_REPORT_KPI = [
  { label: 'ยอดขาย', value: '฿976,500.00', icon: 'coin', accentColor: 'primary' as const },
  { label: 'จำนวนออเดอร์', value: '1,248', icon: 'bill-rastaurant', accentColor: 'info' as const },
  { label: 'จำนวนลูกค้า', value: '3,150', icon: 'people-rate', accentColor: 'success' as const },
  { label: 'เฉลี่ย/ออเดอร์', value: '฿782.45', icon: 'cash-inflow', accentColor: 'warning' as const },
];

const MOCK_KITCHEN_ITEMS = [
  {
    categoryName: 'อาหาร',
    itemCount: 3842,
    percentage: 49.7,
    barColor: 'bg-primary',
  },
  {
    categoryName: 'เครื่องดื่ม',
    itemCount: 2568,
    percentage: 33.2,
    barColor: 'bg-success',
  },
  {
    categoryName: 'ของหวาน',
    itemCount: 1320,
    percentage: 17.1,
    barColor: 'bg-warning',
  },
];

const MOCK_DAILY_BREAKDOWN: MockDailyRow[] = [
  { date: '2026-03-25', totalSales: 42800, orderCount: 58, guestCount: 142, averagePerOrder: 737.93 },
  { date: '2026-03-24', totalSales: 38900, orderCount: 52, guestCount: 128, averagePerOrder: 748.08 },
  { date: '2026-03-23', totalSales: 45200, orderCount: 62, guestCount: 155, averagePerOrder: 729.03 },
  { date: '2026-03-22', totalSales: 31500, orderCount: 41, guestCount: 98, averagePerOrder: 768.29 },
  { date: '2026-03-21', totalSales: 28700, orderCount: 38, guestCount: 92, averagePerOrder: 755.26 },
  { date: '2026-03-20', totalSales: 52100, orderCount: 68, guestCount: 172, averagePerOrder: 766.18 },
  { date: '2026-03-19', totalSales: 48300, orderCount: 65, guestCount: 160, averagePerOrder: 743.08 },
  { date: '2026-03-18', totalSales: 36800, orderCount: 48, guestCount: 118, averagePerOrder: 766.67 },
  { date: '2026-03-17', totalSales: 41200, orderCount: 55, guestCount: 135, averagePerOrder: 749.09 },
  { date: '2026-03-16', totalSales: 33600, orderCount: 44, guestCount: 108, averagePerOrder: 763.64 },
  { date: '2026-03-15', totalSales: 50500, orderCount: 67, guestCount: 168, averagePerOrder: 753.73 },
  { date: '2026-03-14', totalSales: 47100, orderCount: 63, guestCount: 158, averagePerOrder: 747.62 },
  { date: '2026-03-13', totalSales: 29800, orderCount: 39, guestCount: 95, averagePerOrder: 764.10 },
  { date: '2026-03-12', totalSales: 35400, orderCount: 46, guestCount: 115, averagePerOrder: 769.57 },
  { date: '2026-03-11', totalSales: 38200, orderCount: 50, guestCount: 125, averagePerOrder: 764.00 },
];

interface MockDailyRow {
  date: string;
  totalSales: number;
  orderCount: number;
  guestCount: number;
  averagePerOrder: number;
}
