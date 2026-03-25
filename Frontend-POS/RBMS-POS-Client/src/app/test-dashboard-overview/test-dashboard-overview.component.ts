import { Component, OnInit, signal } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-test-dashboard-overview',
  standalone: false,
  templateUrl: './test-dashboard-overview.component.html',
})
export class TestDashboardOverviewComponent implements OnInit {
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

  // Peak Hours — custom HTML bars
  peakHours: PeakHourItem[] = [];

  // KPI + Kitchen
  kpiCards = MOCK_KPI_CARDS;
  kitchenCards = MOCK_KITCHEN_CARDS;

  // Top Selling — Podium data
  topSellingFood = MOCK_TOP_FOOD;
  topSellingBeverage = MOCK_TOP_BEVERAGE;
  topSellingDessert = MOCK_TOP_DESSERT;

  ngOnInit(): void {
    this.buildRevenueTrendChart();
    this.buildPeakHours();
  }

  onDateChange(): void {}
  onRefresh(): void {}

  onTrendToggle(days: 7 | 30): void {
    this.trendDays = days;
    this.buildRevenueTrendChart();
  }

  private buildRevenueTrendChart(): void {
    const today = new Date();
    const days = this.trendDays;
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      // Mock: สุ่มยอดขาย 8,000-40,000
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

  private buildPeakHours(): void {
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

const MOCK_KPI_CARDS = [
  { label: 'ยอดขาย', value: '฿34,500.00', icon: 'coin', accentColor: 'primary' as const, changePercent: 12.5 },
  { label: 'จำนวนออเดอร์', value: '52', icon: 'bill-rastaurant', accentColor: 'info' as const, changePercent: 8.3 },
  { label: 'จำนวนลูกค้า', value: '128', icon: 'people-rate', accentColor: 'success' as const, changePercent: -3.2 },
  { label: 'เฉลี่ย/ออเดอร์', value: '฿663.46', icon: 'cash-inflow', accentColor: 'warning' as const, changePercent: null },
];

const MOCK_KITCHEN_CARDS = [
  { categoryName: 'อาหาร', itemCount: 527, iconName: 'food', color: 'text-primary', bgColor: 'bg-primary-subtle', borderColor: 'border-primary', percent: 33.8 },
  { categoryName: 'เครื่องดื่ม', itemCount: 711, iconName: 'drinks-glass', color: 'text-success', bgColor: 'bg-success-bg', borderColor: 'border-success', percent: 45.6 },
  { categoryName: 'ของหวาน', itemCount: 320, iconName: 'dessert', color: 'text-warning-dark', bgColor: 'bg-warning-bg', borderColor: 'border-warning', percent: 20.6 },
];

const MOCK_TOP_FOOD: TopSellingItem[] = [
  { rank: 1, name: 'ผัดกะเพราหมูสับ', qty: 145, image: 'https://placehold.co/120x120/f97316/white?text=1' },
  { rank: 2, name: 'ข้าวมันไก่', qty: 128, image: 'https://placehold.co/120x120/fb923c/white?text=2' },
  { rank: 3, name: 'ต้มยำกุ้ง', qty: 97, image: 'https://placehold.co/120x120/fdba74/white?text=3' },
  { rank: 4, name: 'ส้มตำไทย', qty: 85, image: 'https://placehold.co/120x120/fed7aa/333?text=4' },
  { rank: 5, name: 'แกงเขียวหวาน', qty: 72, image: 'https://placehold.co/120x120/ffedd5/333?text=5' },
];

const MOCK_TOP_BEVERAGE: TopSellingItem[] = [
  { rank: 1, name: 'ชาเย็น', qty: 210, image: 'https://placehold.co/120x120/14b8a6/white?text=1' },
  { rank: 2, name: 'กาแฟเย็น', qty: 185, image: 'https://placehold.co/120x120/2dd4bf/white?text=2' },
  { rank: 3, name: 'น้ำมะนาว', qty: 142, image: 'https://placehold.co/120x120/5eead4/white?text=3' },
  { rank: 4, name: 'โกโก้เย็น', qty: 98, image: 'https://placehold.co/120x120/99f6e4/333?text=4' },
  { rank: 5, name: 'ชาเขียว', qty: 76, image: 'https://placehold.co/120x120/ccfbf1/333?text=5' },
];

const MOCK_TOP_DESSERT: TopSellingItem[] = [
  { rank: 1, name: 'ไอศกรีมกะทิ', qty: 88, image: 'https://placehold.co/120x120/fbbf24/white?text=1' },
  { rank: 2, name: 'บัวลอย', qty: 72, image: 'https://placehold.co/120x120/fcd34d/white?text=2' },
  { rank: 3, name: 'ขนมปังปิ้ง', qty: 65, image: 'https://placehold.co/120x120/fde68a/333?text=3' },
  { rank: 4, name: 'เครปเค้ก', qty: 54, image: 'https://placehold.co/120x120/fef08a/333?text=4' },
  { rank: 5, name: 'ทับทิมกรอบ', qty: 41, image: 'https://placehold.co/120x120/fef9c3/333?text=5' },
];

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
