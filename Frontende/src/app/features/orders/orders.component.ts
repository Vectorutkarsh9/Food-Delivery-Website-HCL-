import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { RecentOrder } from '../../core/models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div class="container">
        <h1>My Orders</h1>
        <p>Your complete order history</p>
      </div>
    </div>

    <div class="container" style="padding-top:40px;padding-bottom:80px">
      @if (!auth.isLoggedIn()) {
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h3>Please sign in to view your orders</h3>
          <a routerLink="/auth" class="btn btn-primary" style="margin-top:20px">Sign In</a>
        </div>
      } @else if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (orders.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Place your first order and it will appear here</p>
          <a routerLink="/menu" class="btn btn-primary" style="margin-top:20px">Browse Menu</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders; track order.id) {
            <div class="order-card fade-in">
              <div class="order-card-header">
                <div class="order-info">
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span class="order-date">{{ order.createdAt | date:'dd MMM yyyy, h:mm a' }}</span>
                </div>
                <span class="badge {{ getStatusClass(order.status) }}">{{ order.status }}</span>
              </div>

              <div class="order-card-body">
                <div class="order-amount">
                  <span class="amount-label">Total Amount</span>
                  <span class="amount-value">₹{{ order.totalAmount }}</span>
                </div>
                <div class="order-customer">
                  <span>{{ order.customerName }}</span>
                </div>
              </div>

              <div class="order-card-footer">
                <a [routerLink]="['/orders', order.id]" class="btn btn-outline btn-sm">
                  Track Order →
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-list { display: flex; flex-direction: column; gap: 16px; max-width: 700px; margin: 0 auto; }
    .order-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .order-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .order-number { font-weight: 800; font-size: 0.95rem; color: var(--charcoal); display: block; }
    .order-date { font-size: 0.8rem; color: var(--slate); margin-top: 2px; display: block; }
    .order-card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid var(--cream-dark);
      border-bottom: 1px solid var(--cream-dark);
      margin-bottom: 16px;
    }
    .amount-label { font-size: 0.8rem; color: var(--slate); display: block; }
    .amount-value { font-size: 1.3rem; font-weight: 800; color: var(--burgundy); }
    .order-customer { font-size: 0.88rem; color: var(--charcoal-mid); font-weight: 500; }
    .order-card-footer { display: flex; justify-content: flex-end; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: RecentOrder[] = [];
  loading = true;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    const c = this.auth.customer();
    if (!c) { this.loading = false; return; }
    this.api.getCustomerOrders(c.id).subscribe({
      next: r => { this.orders = r.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase().replace('outfordelivery', 'outfordelivery');
  }
}
