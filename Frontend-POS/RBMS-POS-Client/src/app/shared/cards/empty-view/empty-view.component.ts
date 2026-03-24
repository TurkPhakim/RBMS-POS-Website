import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-view',
  standalone: false,
  template: `
    <div
      class="flex flex-col items-center justify-center w-full h-full gap-2 text-surface-sub"
    >
      <app-generic-icon
        name="empty-box"
        svgClass="w-24 h-24"
        class="text-primary opacity-80"
      ></app-generic-icon>
      <p class="text-xl font-semibold">{{ message }}</p>
      @if (detail) {
        <p class="text-center">{{ detail }}</p>
      }
    </div>
  `,
})
export class EmptyViewComponent {
  @Input() message = 'ไม่พบข้อมูล';
  @Input() detail?: string;
}
