import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-mini-card',
  standalone: false,
  host: { class: 'block' },
  template: `
    <div class="bg-surface-card rounded-xl border border-surface-border">
      <!-- Gradient Header -->
      <div
        class="px-5 py-4 rounded-t-xl relative overflow-hidden"
        [ngClass]="headerClass"
      >
        <!-- Decorative Circles -->
        <div
          class="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10"
        ></div>
        <div
          class="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10"
        ></div>
        <div
          class="absolute -top-3 left-[40%] w-14 h-14 rounded-full bg-white/[0.07]"
        ></div>
        <div
          class="absolute -bottom-5 right-[25%] w-16 h-16 rounded-full bg-white/[0.06]"
        ></div>

        <!-- Header Content -->
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            @if (headerIcon) {
              <div
                class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <app-generic-icon
                  [name]="headerIcon"
                  svgClass="w-5 h-5"
                  class="text-white"
                ></app-generic-icon>
              </div>
            }
            <h3 class="text-lg font-bold text-white">{{ headerLabel }}</h3>
          </div>
          <ng-content select="[sectionActions]"></ng-content>
        </div>
      </div>

      <!-- Body -->
      <div [ngClass]="contentClass || 'p-5'">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class SectionMiniCardComponent {
  @Input() headerLabel = '';
  @Input() headerIcon = '';
  @Input() headerClass = 'bg-gradient-to-r from-primary to-primary-dark';
  @Input() contentClass = '';
}
