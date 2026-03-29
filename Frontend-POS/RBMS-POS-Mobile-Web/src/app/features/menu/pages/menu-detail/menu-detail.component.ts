import { Component, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SelfOrderService } from '@core/api/services/self-order.service';
import { ModalService } from '@core/services/modal.service';
import { CustomerMenuDetailResponseModel } from '@core/api/models/customer-menu-detail-response-model';
import { CartService, SelectedOption } from '@core/services/cart.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-menu-detail',
  standalone: false,
  templateUrl: './menu-detail.component.html',
})
export class MenuDetailComponent {
  detail = signal<CustomerMenuDetailResponseModel | null>(null);
  quantity = 1;
  note = '';
  submitted = false;
  radioSelections: Record<number, number> = {};
  checkboxSelections: Record<number, number[]> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private selfOrderService: SelfOrderService,
    private cartService: CartService,
    private modalService: ModalService,
    private destroyRef: DestroyRef,
  ) {
    const menuId = Number(this.route.snapshot.paramMap.get('menuId'));
    this.loadDetail(menuId);
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  getImageUrl(fileId: number): string {
    return `${environment.apiUrl}/api/admin/file/${fileId}`;
  }

  selectRadio(groupId: number, optionItemId: number): void {
    this.radioSelections[groupId] = optionItemId;
  }

  isCheckboxSelected(groupId: number, optionItemId: number): boolean {
    return (this.checkboxSelections[groupId] ?? []).includes(optionItemId);
  }

  toggleCheckbox(groupId: number, optionItemId: number, maxSelections: number): void {
    const current = this.checkboxSelections[groupId] ?? [];
    const idx = current.indexOf(optionItemId);
    if (idx >= 0) {
      this.checkboxSelections[groupId] = current.filter(id => id !== optionItemId);
    } else {
      if (current.length >= maxSelections) return;
      this.checkboxSelections[groupId] = [...current, optionItemId];
    }
  }

  isGroupError(group: any): boolean {
    if (!this.submitted || !group.isRequired) return false;
    if (group.maxSelections === 1) {
      return !this.radioSelections[group.optionGroupId];
    }
    return !(this.checkboxSelections[group.optionGroupId]?.length);
  }

  calcTotalPrice(): number {
    const d = this.detail();
    if (!d) return 0;
    const base = d.price ?? 0;
    let optPrice = 0;

    for (const groupId of Object.keys(this.radioSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +groupId);
      const item = group?.items?.find(i => i.optionItemId === this.radioSelections[+groupId]);
      if (item?.additionalPrice) optPrice += item.additionalPrice;
    }

    for (const groupId of Object.keys(this.checkboxSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +groupId);
      for (const optId of this.checkboxSelections[+groupId]) {
        const item = group?.items?.find(i => i.optionItemId === optId);
        if (item?.additionalPrice) optPrice += item.additionalPrice;
      }
    }

    return (base + optPrice) * this.quantity;
  }

  increaseQty(): void { this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    const d = this.detail();
    if (!d) return;

    this.submitted = true;

    for (const group of d.optionGroups ?? []) {
      if (!group.isRequired) continue;
      if (group.maxSelections === 1 && !this.radioSelections[group.optionGroupId!]) return;
      if (group.maxSelections !== 1 && !this.checkboxSelections[group.optionGroupId!]?.length) return;
    }

    const selectedOptions: SelectedOption[] = [];

    for (const [gId, optId] of Object.entries(this.radioSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +gId);
      const item = group?.items?.find(i => i.optionItemId === optId);
      if (item) {
        selectedOptions.push({
          optionItemId: item.optionItemId!,
          name: item.name!,
          additionalPrice: item.additionalPrice ?? 0,
          groupName: group!.name!,
        });
      }
    }

    for (const [gId, optIds] of Object.entries(this.checkboxSelections)) {
      const group = d.optionGroups?.find(g => g.optionGroupId === +gId);
      for (const optId of optIds) {
        const item = group?.items?.find(i => i.optionItemId === optId);
        if (item) {
          selectedOptions.push({
            optionItemId: item.optionItemId!,
            name: item.name!,
            additionalPrice: item.additionalPrice ?? 0,
            groupName: group!.name!,
          });
        }
      }
    }

    this.cartService.addItem({
      menuId: d.menuId!,
      name: d.name!,
      price: d.price ?? 0,
      quantity: this.quantity,
      note: this.note.trim() || undefined,
      selectedOptions,
      imageFileId: d.imageFileId,
      allergens: d.allergens,
      itemTotal: this.calcTotalPrice(),
    });

    this.router.navigate(['/menu']);
  }

  private loadDetail(menuId: number): void {
    this.selfOrderService.selfOrderGetMenuDetailGet({ menuId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.detail.set(res.result ?? null);
          for (const group of res.result?.optionGroups ?? []) {
            if (group.maxSelections === 1) {
              if (group.isRequired && group.items?.length) {
                this.radioSelections[group.optionGroupId!] = group.items[0].optionItemId!;
              }
            } else {
              this.checkboxSelections[group.optionGroupId!] = [];
            }
          }
        },
      });
  }
}
