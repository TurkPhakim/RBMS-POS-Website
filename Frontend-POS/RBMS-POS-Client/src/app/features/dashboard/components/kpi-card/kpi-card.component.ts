import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: false,
  templateUrl: './kpi-card.component.html',
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value = '0';
  @Input() icon = '';
  @Input() accentColor: 'primary' | 'success' | 'warning' | 'info' | 'danger' =
    'primary';
  @Input() iconSize = 'w-14 h-14';
  @Input() changePercent: number | null = null;
  @Input() showComparison = true;
  @Input() sparklineData: number[] = [];
  @Input() sparklineType: 'bottom' | 'right' | 'background' | 'none' = 'none';
  @Input() comparisonStyle: 'default' | 'circle' | 'below' | 'bold' = 'default';

  private readonly colorMap: Record<string, string> = {
    primary: '#f97316',
    success: '#14b8a6',
    warning: '#f59e0b',
    info: '#0ea5e9',
    danger: '#ef4444',
  };

  get sparklineColor(): string {
    return this.colorMap[this.accentColor] ?? '#f97316';
  }

  get sparklineFillColor(): string {
    return this.sparklineColor + '25';
  }

  get hasSparkline(): boolean {
    return this.sparklineType !== 'none' && this.sparklineData.length >= 2;
  }

  get sparklinePoints(): string {
    if (this.sparklineData.length < 2) return '';
    const d = this.sparklineData;
    const min = Math.min(...d);
    const max = Math.max(...d);
    const range = max - min || 1;
    const w = 200;
    const h = 40;
    return d
      .map((v, i) => {
        const x = (i / (d.length - 1)) * w;
        const y = h - 2 - ((v - min) / range) * (h - 4);
        return `${x},${y}`;
      })
      .join(' ');
  }

  get sparklineAreaPath(): string {
    if (this.sparklineData.length < 2) return '';
    const d = this.sparklineData;
    const min = Math.min(...d);
    const max = Math.max(...d);
    const range = max - min || 1;
    const w = 200;
    const h = 40;
    const pts = d.map((v, i) => {
      const x = (i / (d.length - 1)) * w;
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${x} ${y}`;
    });
    return `M0 ${h} L${pts.join(' L')} L${w} ${h} Z`;
  }
}
