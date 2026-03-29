import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CustomerMenuItemResponseModel } from '@core/api/models/customer-menu-item-response-model';
import { environment } from '@env/environment';

@Component({
  selector: 'app-menu-card',
  standalone: false,
  templateUrl: './menu-card.component.html',
})
export class MenuCardComponent {
  @Input() item!: CustomerMenuItemResponseModel;
  @Input() cardRingClass = '';
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
