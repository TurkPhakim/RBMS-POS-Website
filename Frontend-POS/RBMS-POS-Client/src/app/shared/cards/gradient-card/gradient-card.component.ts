import { Component, Input } from '@angular/core';

type CardColor = 'primary' | 'success' | 'danger' | 'warning';

const COLOR_MAP: Record<CardColor, { gradient: string; border: string }> = {
  primary: { gradient: 'from-primary to-primary-dark', border: 'border-surface-border' },
  success: { gradient: 'from-success to-success-dark', border: 'border-success/30' },
  danger: { gradient: 'from-danger to-danger-dark', border: 'border-danger/30' },
  warning: { gradient: 'from-warning to-warning-dark', border: 'border-warning/30' },
};

@Component({
  selector: 'app-gradient-card',
  standalone: false,
  template: `
    <div class="bg-surface-card rounded-xl border" [ngClass]="borderClass">
      <!-- Gradient Header -->
      <div class="bg-gradient-to-r px-5 py-4 rounded-t-xl relative overflow-hidden" [ngClass]="gradientClass">
        <div class="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10"></div>

        <div class="relative z-10">
          <ng-content select="[cardHeader]"></ng-content>
        </div>
      </div>

      <!-- Body -->
      <div [ngClass]="contentClass">
        <ng-content></ng-content>
      </div>

      <!-- Footer (optional — renders nothing if no content projected) -->
      <ng-content select="[cardFooter]"></ng-content>
    </div>
  `,
})
export class GradientCardComponent {
  @Input() color: CardColor = 'primary';
  @Input() contentClass = '';

  get gradientClass(): string {
    return COLOR_MAP[this.color]?.gradient ?? COLOR_MAP.primary.gradient;
  }

  get borderClass(): string {
    return COLOR_MAP[this.color]?.border ?? COLOR_MAP.primary.border;
  }
}
