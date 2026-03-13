import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <div class="container">
        <h1>Your Cart</h1>
        <p>{{ cart.itemCount() }} item(s) in your cart</p>
      </div>
    </div>

    <div class="container cart-layout">
      @if (cart.items().length === 0) {
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious dishes to get started</p>
          <a routerLink="/menu" class="btn btn-primary" style="margin-top:24px">Browse Menu</a>
        </div>
      } @else {
        <!-- ── CART ITEMS ──────────────────────────────── -->
        <div class="cart-items">
          <div class="cart-header">
            <h2>Order Items</h2>
            <button (click)="cart.clearCart()" class="clear-btn">Clear All</button>
          </div>

          @for (item of cart.items(); track item.foodItem.id) {
            <div class="cart-item fade-in">
              <div class="cart-item-img">
                @if (item.foodItem.imageUrl) {
                  <img [src]="item.foodItem.imageUrl" [alt]="item.foodItem.name">
                } @else {
                  <div class="img-placeholder-sm">🍽</div>
                }
              </div>
              <div class="cart-item-info">
                <h3>{{ item.foodItem.name }}</h3>
                <p class="item-cat">{{ item.foodItem.categoryName }}</p>
                <span class="badge" [class]="item.foodItem.isVegetarian ? 'badge-veg' : 'badge-nonveg'" style="font-size:0.65rem">
                  {{ item.foodItem.isVegetarian ? '🌿 Veg' : '🍖 Non-veg' }}
                </span>
              </div>
              <div class="cart-item-qty">
                <div class="qty-control">
                  <button class="qty-btn" (click)="cart.updateQuantity(item.foodItem.id, item.quantity - 1)">−</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="cart.addItem(item.foodItem)">+</button>
                </div>
              </div>
              <div class="cart-item-price">
                <strong>₹{{ getItemTotal(item) }}</strong>
                <button (click)="cart.removeItem(item.foodItem.id)" class="remove-btn">✕</button>
              </div>
            </div>
          }
        </div>

        <!-- ── ORDER SUMMARY + CHECKOUT ──────────────── -->
        <div class="order-summary">
          <div class="summary-card card">
            <div class="card-body">
              <h2>Order Summary</h2>
              <div class="divider"></div>

              <div class="summary-row">
                <span>Subtotal</span>
                <strong>₹{{ cart.subtotal() }}</strong>
              </div>
              <div class="summary-row">
                <span>Delivery Charge</span>
                @if (cart.deliveryCharge() === 0) {
                  <strong class="free-delivery">FREE 🎉</strong>
                } @else {
                  <strong>₹{{ cart.deliveryCharge() }}</strong>
                }
              </div>
              @if (cart.deliveryCharge() > 0) {
                <p class="free-delivery-hint">Add ₹{{ 500 - cart.subtotal() }} more for free delivery</p>
              }
              <div class="divider"></div>
              <div class="summary-total">
                <span>Total</span>
                <strong>₹{{ cart.total() }}</strong>
              </div>

              <!-- ── DELIVERY FORM ──────────────────── -->
              @if (!auth.isLoggedIn()) {
                <div class="login-prompt">
                  <p>Please sign in to place your order</p>
                  <a routerLink="/auth" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:12px">
                    Sign In / Register
                  </a>
                </div>
              } @else {
                <div class="delivery-form">
                  <h3>Delivery Details</h3>
                  <div class="form-group">
                    <label class="form-label">Delivery Address</label>
                    <textarea [(ngModel)]="address" class="form-control" rows="2" placeholder="Full address"></textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">City</label>
                      <input [(ngModel)]="city" class="form-control" placeholder="City">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Pincode</label>
                      <input [(ngModel)]="pincode" class="form-control" placeholder="Pincode">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input [(ngModel)]="phone" class="form-control" placeholder="Contact number">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Payment Method</label>
                    <select [(ngModel)]="paymentMethod" class="form-control">
                      <option value="CashOnDelivery">Cash on Delivery</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>
                  <button (click)="placeOrder()" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px"
                    [disabled]="placing || !address || !city || !pincode || !phone">
                    {{ placing ? 'Placing Order...' : '🛍 Place Order' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      padding-top: 40px;
      padding-bottom: 80px;
      align-items: start;
    }
    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .cart-header h2 { font-size: 1.4rem; }
    .clear-btn {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    .clear-btn:hover { opacity: 0.7; }
    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--white);
      padding: 16px;
      border-radius: var(--radius-md);
      margin-bottom: 12px;
      box-shadow: var(--shadow-sm);
    }
    .cart-item-img {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-md);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--cream-dark);
    }
    .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder-sm {
      width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }
    .cart-item-info { flex: 1; }
    .cart-item-info h3 { font-size: 0.95rem; font-family: 'Playfair Display', serif; margin-bottom: 4px; }
    .item-cat { font-size: 0.78rem; color: var(--slate); margin-bottom: 4px; }
    .cart-item-qty { flex-shrink: 0; }
    .cart-item-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }
    .cart-item-price strong { font-size: 1rem; color: var(--burgundy); }
    .remove-btn {
      background: none;
      border: none;
      color: var(--slate);
      cursor: pointer;
      font-size: 0.75rem;
      transition: var(--transition);
    }
    .remove-btn:hover { color: var(--danger); }

    /* ── SUMMARY ───────────────────────────────────── */
    .summary-card { position: sticky; top: 88px; }
    .summary-card h2 { font-size: 1.3rem; margin-bottom: 8px; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 0.9rem;
      color: var(--charcoal-mid);
    }
    .free-delivery { color: var(--success); }
    .free-delivery-hint {
      font-size: 0.78rem;
      color: var(--warning);
      background: #FEF3C7;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      margin-top: -4px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 10px 0;
    }
    .summary-total strong { color: var(--burgundy); font-size: 1.3rem; }
    .delivery-form { margin-top: 20px; }
    .delivery-form h3 { font-size: 1rem; margin-bottom: 16px; color: var(--charcoal-mid); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .login-prompt { text-align: center; padding: 16px 0; color: var(--slate); }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .summary-card { position: static; }
    }
  `]
})
export class CartComponent {
  address = '';
  city = '';
  pincode = '';
  phone = '';
  paymentMethod = 'CashOnDelivery';
  placing = false;

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {
    const c = auth.customer();
    if (c) {
      this.address = c.address ?? '';
      this.city    = c.city    ?? '';
      this.pincode = c.pincode ?? '';
      this.phone   = c.phone   ?? '';
    }
  }

  getItemTotal(item: any): number {
    const price = item.foodItem.discountPrice ?? item.foodItem.price;
    return price * item.quantity;
  }

  placeOrder() {
    const customer = this.auth.customer();
    if (!customer) return;

    this.placing = true;
    const dto = {
      customerId:         customer.id,
      deliveryAddress:    this.address,
      deliveryCity:       this.city,
      deliveryPincode:    this.pincode,
      deliveryPhone:      this.phone,
      paymentMethod:      this.paymentMethod as any,
      items: this.cart.items().map(i => ({
        foodItemId: i.foodItem.id,
        quantity:   i.quantity
      }))
    };

    this.api.createOrder(dto).subscribe({
      next: r => {
        this.cart.clearCart();
        this.toast.success('Order placed successfully! 🎉');
        this.router.navigate(['/orders', r.data.id]);
      },
      error: () => {
        this.toast.error('Failed to place order. Please try again.');
        this.placing = false;
      }
    });
  }
}
