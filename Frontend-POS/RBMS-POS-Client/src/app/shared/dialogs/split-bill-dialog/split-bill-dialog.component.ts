import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { OrderItemResponseModel } from '@app/core/api/models';

const BILL_COLORS = [
  { bg: 'bg-primary/10', border: 'border-primary', text: 'text-primary', dot: 'bg-primary' },
  { bg: 'bg-info/10', border: 'border-info', text: 'text-info', dot: 'bg-info' },
  { bg: 'bg-success/10', border: 'border-success', text: 'text-success', dot: 'bg-success' },
  { bg: 'bg-warning/10', border: 'border-warning-dark', text: 'text-warning-dark', dot: 'bg-warning-dark' },
  { bg: 'bg-danger/10', border: 'border-danger', text: 'text-danger', dot: 'bg-danger' },
];

@Component({
  selector: 'app-split-bill-dialog',
  standalone: false,
  templateUrl: './split-bill-dialog.component.html',
})
export class SplitBillDialogComponent implements OnInit {
  headerLabel = '';
  mode: 'by-amount' | 'by-item' = 'by-amount';
  numberOfSplits = 2;
  totalAmount = 0;
  itemGroups: ItemGroup[] = [];
  numberOfGroups = 2;
  groupOptions: { label: string; value: number }[] = [];

  constructor(
    private readonly config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
  ) {}

  ngOnInit(): void {
    this.headerLabel = this.config.header ?? 'แยกบิลชำระเงิน';
    const items: OrderItemResponseModel[] = (this.config.data?.items ?? []).filter(
      (i: OrderItemResponseModel) => i.status !== 'Voided' && i.status !== 'Cancelled',
    );
    this.itemGroups = items.map((item) => ({
      orderItemId: item.orderItemId!,
      menuNameThai: item.menuNameThai ?? '',
      quantity: item.quantity ?? 1,
      totalPrice: item.totalPrice ?? 0,
      groupIndex: 0,
    }));
    this.totalAmount = this.itemGroups.reduce((sum, ig) => sum + ig.totalPrice, 0);
    this.updateGroupOptions();
  }

  get perSplitAmount(): number {
    if (this.numberOfSplits <= 0) return 0;
    return Math.ceil(this.totalAmount / this.numberOfSplits);
  }

  get activeItemCount(): number {
    return this.itemGroups.length;
  }

  getBillColor(index: number): (typeof BILL_COLORS)[0] {
    return BILL_COLORS[index % BILL_COLORS.length];
  }

  onModeChange(mode: 'by-amount' | 'by-item'): void {
    this.mode = mode;
  }

  decrementSplits(): void {
    if (this.numberOfSplits > 2) this.numberOfSplits--;
  }

  incrementSplits(): void {
    if (this.numberOfSplits < 10) this.numberOfSplits++;
  }

  decrementGroups(): void {
    if (this.numberOfGroups > 2) {
      this.numberOfGroups--;
      this.onGroupCountChange();
    }
  }

  incrementGroups(): void {
    if (this.numberOfGroups < 10) {
      this.numberOfGroups++;
      this.onGroupCountChange();
    }
  }

  onGroupCountChange(): void {
    this.updateGroupOptions();
    this.itemGroups.forEach((ig) => {
      if (ig.groupIndex >= this.numberOfGroups) {
        ig.groupIndex = 0;
      }
    });
  }

  private updateGroupOptions(): void {
    this.groupOptions = Array.from({ length: this.numberOfGroups }, (_, i) => ({
      label: `บิล ${i + 1}`,
      value: i,
    }));
  }

  getGroupSubtotal(groupIndex: number): number {
    return this.itemGroups
      .filter((ig) => ig.groupIndex === groupIndex)
      .reduce((sum, ig) => sum + ig.totalPrice, 0);
  }

  getGroupItemCount(groupIndex: number): number {
    return this.itemGroups.filter((ig) => ig.groupIndex === groupIndex).length;
  }

  isValid(): boolean {
    if (this.mode === 'by-amount') {
      return this.numberOfSplits >= 2 && this.numberOfSplits <= 10;
    }
    const groups = new Set(this.itemGroups.map((ig) => ig.groupIndex));
    return groups.size >= 2;
  }

  onConfirm(): void {
    if (!this.isValid()) return;

    if (this.mode === 'by-amount') {
      this.ref.close({ mode: 'by-amount', numberOfSplits: this.numberOfSplits });
    } else {
      const groupMap = new Map<number, number[]>();
      this.itemGroups.forEach((ig) => {
        const list = groupMap.get(ig.groupIndex) ?? [];
        list.push(ig.orderItemId);
        groupMap.set(ig.groupIndex, list);
      });
      const groups = Array.from(groupMap.values())
        .filter((ids) => ids.length > 0)
        .map((ids) => ({ orderItemIds: ids }));
      this.ref.close({ mode: 'by-item', groups });
    }
  }

  onCancel(): void {
    this.ref.close();
  }
}

interface ItemGroup {
  orderItemId: number;
  menuNameThai: string;
  quantity: number;
  totalPrice: number;
  groupIndex: number;
}
