import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ApiConfiguration } from '@app/core/api/api-configuration';
import { MenuOptionGroupResponseModel, MenuOptionItemResponseModel, MenuResponseModel } from '@app/core/api/models';

@Component({
  selector: 'app-menu-item-dialog',
  standalone: false,
  templateUrl: './menu-item-dialog.component.html',
})
export class MenuItemDialogComponent implements OnInit {
  menu!: MenuResponseModel;
  headerLabel = '';
  quantity = 1;
  note = '';
  submitted = false;
  selectedOptions: Map<number, SelectedOption[]> = new Map();

  constructor(
    private readonly apiConfig: ApiConfiguration,
    private readonly config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
  ) {}

  getImageUrl(fileId: number): string {
    return `${this.apiConfig.rootUrl}/api/admin/file/${fileId}`;
  }

  ngOnInit(): void {
    this.menu = this.config.data.menu;
    this.headerLabel = this.config.header ?? '';
  }

  isOptionSelected(groupId: number, itemId: number): boolean {
    const selections = this.selectedOptions.get(groupId) ?? [];
    return selections.some((s) => s.optionItemId === itemId);
  }

  onToggleOption(group: MenuOptionGroupResponseModel, item: MenuOptionItemResponseModel): void {
    const groupId = group.optionGroupId!;
    const current = this.selectedOptions.get(groupId) ?? [];
    const existing = current.findIndex((s) => s.optionItemId === item.optionItemId);

    if (existing >= 0) {
      const updated = [...current];
      updated.splice(existing, 1);
      this.selectedOptions.set(groupId, updated);
    } else {
      const maxSelect = group.maxSelect ?? 999;
      if (current.length >= maxSelect) {
        if (maxSelect === 1) {
          this.selectedOptions.set(groupId, [
            {
              optionGroupId: groupId,
              optionItemId: item.optionItemId!,
              optionItemName: item.name ?? '',
              additionalPrice: item.additionalPrice ?? 0,
            },
          ]);
        }
        return;
      }
      this.selectedOptions.set(groupId, [
        ...current,
        {
          optionGroupId: groupId,
          optionItemId: item.optionItemId!,
          optionItemName: item.name ?? '',
          additionalPrice: item.additionalPrice ?? 0,
        },
      ]);
    }
  }

  getOptionsTotalPrice(): number {
    let total = 0;
    this.selectedOptions.forEach((selections) => {
      selections.forEach((s) => (total += s.additionalPrice));
    });
    return total;
  }

  getTotalPrice(): number {
    return ((this.menu.price ?? 0) + this.getOptionsTotalPrice()) * this.quantity;
  }

  isValid(): boolean {
    if (!this.menu.optionGroups) return true;
    for (const group of this.menu.optionGroups) {
      if (group.isRequired) {
        const selections = this.selectedOptions.get(group.optionGroupId!) ?? [];
        if (selections.length < (group.minSelect ?? 1)) {
          return false;
        }
      }
    }
    return true;
  }

  onIncrease(): void {
    if (this.quantity < 999) this.quantity++;
  }

  onDecrease(): void {
    if (this.quantity > 1) this.quantity--;
  }

  isGroupError(group: MenuOptionGroupResponseModel): boolean {
    if (!this.submitted || !group.isRequired) return false;
    const selections = this.selectedOptions.get(group.optionGroupId!) ?? [];
    return selections.length < (group.minSelect ?? 1);
  }

  onConfirm(): void {
    this.submitted = true;
    if (!this.isValid()) return;

    const allOptions: SelectedOption[] = [];
    this.selectedOptions.forEach((selections) => allOptions.push(...selections));

    this.ref.close({
      menuId: this.menu.menuId!,
      nameThai: this.menu.nameThai ?? '',
      unitPrice: this.menu.price ?? 0,
      quantity: this.quantity,
      note: this.note,
      options: allOptions,
      optionsTotalPrice: this.getOptionsTotalPrice(),
      totalPrice: this.getTotalPrice(),
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}

interface SelectedOption {
  optionGroupId: number;
  optionItemId: number;
  optionItemName: string;
  additionalPrice: number;
}
