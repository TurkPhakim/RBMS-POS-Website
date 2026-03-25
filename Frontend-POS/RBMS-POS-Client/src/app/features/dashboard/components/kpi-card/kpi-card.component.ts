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
  @Input() accentColor: 'primary' | 'success' | 'warning' | 'info' = 'primary';
  @Input() changePercent: number | null = null;
  @Input() showComparison = true;
}
