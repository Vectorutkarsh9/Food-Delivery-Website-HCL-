import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
        <button (click)="load()" class="btn btn-outline btn-sm">↺ Refresh</button>
      </div>

      @if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (stats) {
        <!-- Stats Cards -->
        <div class="stats-grid fade-in">
          <div class="stat-card stat-orders">
            <div class="stat-icon">📦</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">Total Orders</div>
            </div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.pendingOrders }}</div>
              <div class="stat-label">Pending Orders</div>
            </div>
          </div>
          <div class="stat-card stat-delivered">
            <div class="stat-icon">✅</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.deliveredOrders }}</div>
              <div class="stat-label">Delivered</div>
            </div>
          </div>
          <div class="stat-card stat-revenue">
            <div class="stat-icon">💰</div>
            <div class="stat-body">
              <div class="stat-value">₹{{ stats.totalRevenue | number:'1.0-0' }}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
          </div>
          <div class="stat-card stat-customers">
            <div class="stat-icon">👥</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalCustomers }}</div>
              <div class="stat-label">Customers</div>
            </div>
          </div>
          <div class="stat-card stat-items">
            <div class="stat-icon">🍽</div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.totalFoodItems }}</div>
              <div class="stat-label">Active Menu Items</div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="section-card fade-in">
          <div class="section-card-header">
            <h2>Recent Orders</h2>
            <a routerLink="/admin/orders" class="btn btn-outline btn-sm">View All →</a>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (order of stats.recentOrders; track order.id) {
                  <tr>
                    <td><strong>{{ order.orderNumber }}</strong></td>
                    <td>{{ order.customerName }}</td>
                    <td><strong style="color:var(--burgundy)">₹{{ order.totalAmount }}</strong></td>
                    <td><span class="badge {{ getStatusClass(order.status) }}">{{ order.status }}</span></td>
                    <td>{{ order.createdAt | date:'dd MMM, h:mm a' }}</td>
                    <td>
                      <a [routerLink]="['/orders', order.id]" class="btn btn-outline btn-sm">View</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page { padding: 32px; }
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .admin-page-header h1 { font-size: 1.8rem; }
    .admin-page-header p { color: var(--slate); margin-top: 4px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      border-left: 4px solid transparent;
      transition: var(--transition);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .stat-orders   { border-left-color: var(--info); }
    .stat-pending  { border-left-color: var(--warning); }
    .stat-delivered{ border-left-color: var(--success); }
    .stat-revenue  { border-left-color: var(--gold); }
    .stat-customers{ border-left-color: var(--burgundy); }
    .stat-items    { border-left-color: var(--burgundy-light); }
    .stat-icon { font-size: 2.2rem; }
    .stat-value { font-size: 1.8rem; font-weight: 900; font-family: 'Playfair Display', serif; color: var(--charcoal); }
    .stat-label { font-size: 0.8rem; color: var(--slate); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }

    .section-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .section-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 2px solid var(--cream-dark);
    }
    .section-card-header h2 { font-size: 1.2rem; }

    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .stats-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getDashboardStats().subscribe({
      next: r => { this.stats = r.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
