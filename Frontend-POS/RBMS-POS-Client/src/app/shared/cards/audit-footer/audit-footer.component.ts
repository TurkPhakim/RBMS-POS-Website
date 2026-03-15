import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audit-footer',
  standalone: false,
  template: `
    <div class="bg-white rounded-xl border border-surface-border px-6 py-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Created -->
        <div>
          <p class="text-lg text-surface-sub mb-1">ผู้สร้าง</p>
          <p class="text-2xl font-bold text-primary-dark">
            {{ createdByName || '-' }}
          </p>
          @if (createdAt) {
            <p class="text-xl text-surface-sub mt-1.5">
              {{ createdAt | date: 'dd/MM/yyyy HH:mm' }} น.
            </p>
          }
        </div>

        <!-- Updated -->
        <div>
          <p class="text-lg text-surface-sub mb-1">ผู้อัพเดต</p>
          <p class="text-2xl font-bold text-primary-dark">
            {{ updatedByName || '-' }}
          </p>
          @if (updatedAt) {
            <p class="text-xl text-surface-sub mt-1.5">
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
}
