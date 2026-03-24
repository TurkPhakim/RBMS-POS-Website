import { Injectable, signal, computed } from '@angular/core';

const CART_KEY = 'customer_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.loadFromStorage());
  itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.itemTotal, 0));

  addItem(item: CartItem): void {
    this.items.update(items => [...items, item]);
    this.saveToStorage();
  }

  updateQuantity(index: number, quantity: number): void {
    this.items.update(items => {
      const updated = [...items];
      const item = { ...updated[index] };
      item.quantity = quantity;
      item.itemTotal = this.calcTotal(item);
      updated[index] = item;
      return updated;
    });
    this.saveToStorage();
  }

  updateNote(index: number, note: string): void {
    this.items.update(items => {
      const updated = [...items];
      updated[index] = { ...updated[index], note: note || undefined };
      return updated;
    });
    this.saveToStorage();
  }

  removeItem(index: number): void {
    this.items.update(items => items.filter((_, i) => i !== index));
    this.saveToStorage();
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  private calcTotal(item: CartItem): number {
    const optPrice = item.selectedOptions.reduce((s, o) => s + o.additionalPrice, 0);
    return (item.price + optPrice) * item.quantity;
  }

  private loadFromStorage(): CartItem[] {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  }

  private saveToStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items()));
  }
}

export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  selectedOptions: SelectedOption[];
  imageFileId?: number | null;
  itemTotal: number;
}

export interface SelectedOption {
  optionItemId: number;
  name: string;
  additionalPrice: number;
  groupName: string;
}
