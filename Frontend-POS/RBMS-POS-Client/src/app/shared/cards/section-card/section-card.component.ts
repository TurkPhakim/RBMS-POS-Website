import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  standalone: false,
  template: `
    <div class="bg-surface-card rounded-xl border border-surface-border">
      <!-- Gradient Header -->
      <div
        class="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 rounded-t-xl relative overflow-hidden"
      >
        <!-- Decorative Circles-->
        <div
          class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10"
        ></div>
        <div
          class="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10"
        ></div>
        <div
          class="absolute -top-5 left-[18%] w-24 h-24 rounded-full bg-white/[0.07]"
        ></div>
        <div
          class="absolute -bottom-8 left-[35%] w-28 h-28 rounded-full bg-white/[0.06]"
        ></div>
        <div
          class="absolute -top-4 left-[50%] w-20 h-20 rounded-full bg-white/[0.08]"
        ></div>
        <div
          class="absolute -bottom-5 right-[22%] w-24 h-24 rounded-full bg-white/[0.07]"
        ></div>
        <div
          class="absolute top-1/3 right-[10%] w-20 h-20 rounded-full bg-white/5"
        ></div>
        <div
          class="absolute -top-6 right-[30%] w-22 h-22 rounded-full bg-white/[0.06]"
        ></div>
        <div
          class="absolute top-[50%] left-[8%] w-16 h-16 rounded-full bg-white/[0.08]"
        ></div>
        <div
          class="absolute -bottom-4 right-[50%] w-18 h-18 rounded-full bg-white/5"
        ></div>
        <div
          class="absolute top-[40%] left-[42%] w-14 h-14 rounded-full bg-white/[0.07]"
        ></div>
        <div
          class="absolute -top-3 left-[72%] w-16 h-16 rounded-full bg-white/10"
        ></div>

        <!-- Header Content -->
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            @if (headerIcon) {
              <div
                class="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center"
              >
                <app-generic-icon
                  [name]="headerIcon"
                  svgClass="w-7 h-7"
                  class="text-white"
                ></app-generic-icon>
              </div>
            }
            <div>
              <h2 class="text-2xl font-bold text-white">{{ headerLabel }}</h2>
              @if (headerSubtitle) {
                <p class="text-white/70 text-sm mt-0.5">{{ headerSubtitle }}</p>
              }
            </div>
          </div>
          <ng-content select="[sectionActions]"></ng-content>
        </div>
      </div>

      <!-- Body -->
      <div [ngClass]="contentClass || 'p-6'">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class SectionCardComponent {
  @Input() headerLabel = '';
  @Input() headerSubtitle = '';
  @Input() headerIcon = '';
  @Input() contentClass = '';
}
