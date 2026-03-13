import { Injectable, signal, computed } from '@angular/core';
import { CartItem, FoodItem } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items     = this._items.asReadonly();
  itemCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  subtotal  = computed(() =>
    this._items().reduce((sum, i) => {
      const price = i.foodItem.discountPrice ?? i.foodItem.price;
      return sum + price * i.quantity;
    }, 0)
  );
  deliveryCharge = computed(() => this.subtotal() >= 500 ? 0 : 40);
  total          = computed(() => this.subtotal() + this.deliveryCharge());

  addItem(foodItem: FoodItem, quantity = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.foodItem.id === foodItem.id);
      if (existing) {
        return items.map(i =>
          i.foodItem.id === foodItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...items, { foodItem, quantity }];
    });
  }

  removeItem(foodItemId: number): void {
    this._items.update(items => items.filter(i => i.foodItem.id !== foodItemId));
  }

  updateQuantity(foodItemId: number, quantity: number): void {
    if (quantity <= 0) { this.removeItem(foodItemId); return; }
    this._items.update(items =>
      items.map(i => i.foodItem.id === foodItemId ? { ...i, quantity } : i)
    );
  }

  clearCart(): void {
    this._items.set([]);
  }

  isInCart(foodItemId: number): boolean {
    return this._items().some(i => i.foodItem.id === foodItemId);
  }

  getQuantity(foodItemId: number): number {
    return this._items().find(i => i.foodItem.id === foodItemId)?.quantity ?? 0;
  }
}
