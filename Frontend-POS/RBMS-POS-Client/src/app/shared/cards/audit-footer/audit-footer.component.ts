import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audit-footer',
  standalone: false,
  template: `
    <div
      class="bg-white rounded-xl border border-surface-border"
      [class.px-6]="!compact"
      [class.py-5]="!compact"
      [class.px-4]="compact"
      [class.py-3]="compact"
    >
      <div
        class="grid grid-cols-1 md:grid-cols-2"
        [class.gap-5]="!compact"
        [class.gap-3]="compact"
      >
        <!-- Created -->
        <div>
          <p
            [class]="
              compact
                ? 'text-sm text-surface-sub mb-0.5'
                : 'text-lg text-surface-sub mb-1'
            "
          >
            ผู้สร้าง
          </p>
          <p
            [class]="
              compact
                ? 'font-bold text-primary-dark'
                : 'text-2xl font-bold text-primary-dark'
            "
          >
            {{ createdByName || '-' }}
          </p>
          @if (createdAt) {
            <p
              [class]="
                compact
                  ? 'text-sm text-surface-sub mt-0.5'
                  : 'text-xl text-surface-sub mt-1.5'
              "
            >
              {{ createdAt | date: 'dd/MM/yyyy HH:mm' }} น.
            </p>
          }
        </div>

        <!-- Updated -->
        <div>
          <p
            [class]="
              compact
                ? 'text-sm text-surface-sub mb-0.5'
                : 'text-lg text-surface-sub mb-1'
            "
          >
            ผู้อัพเดต
          </p>
          <p
            [class]="
              compact
                ? 'font-bold text-primary-dark'
                : 'text-2xl font-bold text-primary-dark'
            "
          >
            {{ updatedByName || '-' }}
          </p>
          @if (updatedAt) {
            <p
              [class]="
                compact
                  ? 'text-sm text-surface-sub mt-0.5'
                  : 'text-xl text-surface-sub mt-1.5'
              "
            >
              {{ updatedAt | date: 'dd/MM/yyyy HH:mm' }} น.
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class AuditFooterComponent {
  @Input() createdByName: string | null | undefined;
  @Input() createdAt: string | null | undefined;
  @Input() updatedByName: string | null | undefined;
  @Input() updatedAt: string | null | undefined;
  @Input() compact = false;
}
