import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-header',
  standalone: false,
  host: { class: 'block' },
  template: `
    <div
      class="relative overflow-hidden px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-2 sm:gap-3"
      [ngClass]="gradientClass"
    >
      <!-- Decorative circles -->
      <div
        class="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10"
      ></div>
      <div
        class="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10"
      ></div>
      <div
        class="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-white/5"
      ></div>
      <div
        class="absolute -top-2 left-1/3 w-12 h-12 rounded-full bg-white/[0.06]"
      ></div>
      <div
        class="absolute bottom-0 right-1/2 w-6 h-6 rounded-full bg-white/5"
      ></div>
      <div
        class="absolute top-1 left-2/3 w-5 h-5 rounded-full bg-white/10"
      ></div>
      <div
        class="absolute -bottom-6 right-1/3 w-16 h-16 rounded-full bg-white/[0.06]"
      ></div>

      <!-- Icon -->
      <span
        class="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 flex items-center justify-center shrink-0"
      >
        <app-generic-icon
          [name]="icon"
          [svgClass]="iconSize"
          class="text-white"
        ></app-generic-icon>
      </span>

      <!-- Title + Subtitle -->
      <div class="relative z-10 flex-1 min-w-0">
        <p class="font-extrabold text-lg sm:text-xl text-white tracking-wide truncate">
          {{ title }}
        </p>
        @if (subtitle) {
          <p class="text-xs sm:text-sm text-white/70 truncate">{{ subtitle }}</p>
        }
      </div>

      <!-- Right slot -->
      <ng-content select="[cardHeaderRight]"></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
  @Input() icon = '';
  @Input() iconSize = 'w-7 h-7';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() gradient: 'primary' | 'info' | 'success' | 'billing' | 'warning' =
    'primary';

  get gradientClass(): string {
    const map: Record<string, string> = {
      primary: 'bg-gradient-to-r from-primary to-primary-dark',
      info: 'bg-gradient-to-r from-info to-info-dark',
      success: 'bg-gradient-to-r from-success to-success-dark',
      billing: 'bg-gradient-to-r from-billing to-billing-dark',
      warning: 'bg-gradient-to-r from-warning to-warning-dark',
    };
    return map[this.gradient] || map['primary'];
  }
}
