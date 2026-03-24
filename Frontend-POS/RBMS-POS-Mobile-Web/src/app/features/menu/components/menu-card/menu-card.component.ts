import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CustomerMenuItemResponseModel } from '@core/api/models/customer-menu-item-response-model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-menu-card',
  standalone: false,
  template: `
    <button
      class="bg-surface-card rounded-xl text-left w-full active:scale-[0.98] transition-all group"
      (click)="cardClick.emit()"
    >
      <!-- Image -->
      <div class="relative aspect-square bg-surface-hover flex items-center justify-center overflow-hidden rounded-t-xl">
        @if (item.imageFileId) {
          <img
            [src]="imageUrl"
            [alt]="item.name"
            class="w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
          />
        } @else {
          <app-generic-icon [name]="placeholderIcon" svgClass="w-20 h-20" class="text-surface-sub"></app-generic-icon>
        }
        <!-- Pinned Badge (มุมซ้ายบน) -->
        @if (item.isPinned) {
          <span class="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <app-generic-icon name="pin-tag" svgClass="w-4 h-4" class="text-white"></app-generic-icon>
          </span>
        }
        <!-- Tag Badges (มุมขวาบน) -->
        @if (item.tags) {
          <div class="absolute top-1.5 right-1.5 flex flex-col gap-1.5">
            @if (hasTag(1)) {
              <span class="w-9 h-9 rounded-full bg-danger flex items-center justify-center">
                <app-generic-icon name="thumb-tag" svgClass="w-5 h-5" class="text-white"></app-generic-icon>
              </span>
            }
            @if (hasTag(2)) {
              <span class="w-9 h-9 rounded-full bg-success flex items-center justify-center">
                <app-generic-icon name="clover-tag" svgClass="w-5 h-5" class="text-white"></app-generic-icon>
              </span>
            }
            @if (hasTag(4)) {
              <span class="w-9 h-9 rounded-full bg-warning flex items-center justify-center">
                <app-generic-icon name="time-tag" svgClass="w-5 h-5" class="text-white"></app-generic-icon>
              </span>
            }
          </div>
        }
      </div>
      <!-- Info -->
      <div class="p-3">
        <div class="flex items-start gap-1">
          <span class="font-bold text-base line-clamp-1 flex-1">{{ item.name }}</span>
          @if (item.allergens) {
            <app-generic-icon
              name="shield-warning"
              svgClass="w-8 h-8"
              class="text-warning flex-shrink-0 cursor-help"
              [pTooltip]="'สารก่อภูมิแพ้: ' + item.allergens"
              tooltipPosition="top"
              appendTo="body"
            ></app-generic-icon>
          }
        </div>
        @if (item.nameEn) {
          <div class="text-sm text-surface-sub line-clamp-1">{{ item.nameEn }}</div>
        }
        @if (item.caloriesPerServing) {
          <div class="text-sm text-surface-sub mt-0.5 flex items-center gap-0.5">
            <app-generic-icon name="thunder" svgClass="w-5 h-5" class="text-primary"></app-generic-icon>
            {{ item.caloriesPerServing }} Kcal
          </div>
        }
        <div class="flex items-end justify-between mt-1.5">
          <div>
            @if (item.hasOptions) {
              <div class="text-xs text-surface-sub flex items-center gap-0.5">
                <app-generic-icon name="option-extra" svgClass="w-4 h-4"></app-generic-icon>
                มีตัวเลือก
              </div>
            }
          </div>
          <span class="text-xl font-bold text-primary">
            {{ item.price | number:'1.0-0' }} บาท
          </span>
        </div>
      </div>
    </button>
  `,
})
export class MenuCardComponent {
  @Input() item!: CustomerMenuItemResponseModel;
  @Output() cardClick = new EventEmitter<void>();

  get imageUrl(): string {
    return `${environment.apiUrl}/api/admin/file/${this.item.imageFileId}`;
  }

  get placeholderIcon(): string {
    switch (this.item.categoryType) {
      case 1: return 'chicken-drumstick';
      case 2: return 'drinks-glass';
      case 3: return 'dessert';
      default: return 'food';
    }
  }

  hasTag(flag: number): boolean {
    return ((this.item.tags ?? 0) & flag) !== 0;
  }
}
