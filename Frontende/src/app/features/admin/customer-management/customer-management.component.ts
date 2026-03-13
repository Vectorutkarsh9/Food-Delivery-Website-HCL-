import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Customer, RecentOrder } from '../../../core/models/models';

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <div>
          <h1>Customer Management</h1>
          <p>View and manage all registered customers</p>
        </div>
        <div class="search-wrap-sm">
          <input [(ngModel)]="search" (ngModelChange)="applyFilter()"
            placeholder="🔍  Search customers..."
            class="form-control">
        </div>
      </div>

      @if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else {
        <div class="section-card fade-in">
          <div class="section-card-header">
            <h2>Customers ({{ filtered.length }})</h2>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filtered; track c.id) {
                  <tr>
                    <td>{{ c.id }}</td>
                    <td>
                      <div class="customer-cell">
                        <div class="customer-avatar">{{ c.name.charAt(0) }}</div>
                        <strong>{{ c.name }}</strong>
                      </div>
                    </td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.phone || '—' }}</td>
                    <td>{{ c.city || '—' }}</td>
                    <td>
                      <span class="badge {{ c.isActive ? 'badge-delivered' : 'badge-cancelled' }}">
                        {{ c.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>{{ c.createdAt | date:'dd MMM yyyy' }}</td>
                    <td>
                      <button (click)="viewOrders(c)" class="btn btn-outline btn-sm">
                        View Orders
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- ── ORDER HISTORY MODAL ────────────────── -->
    @if (ordersModal && selectedCustomer) {
      <div class="modal-overlay" (click)="ordersModal=false">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ selectedCustomer.name }}'s Orders</h3>
              <div style="font-size:0.8rem;color:var(--slate);margin-top:2px">{{ selectedCustomer.email }}</div>
            </div>
            <button (click)="ordersModal=false" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            @if (loadingOrders) {
              <div class="spinner-wrap" style="min-height:100px"><div class="spinner"></div></div>
            } @else if (customerOrders.length === 0) {
              <div class="empty-state" style="padding:40px">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
              </div>
            } @else {
              <div class="orders-list">
                @for (order of customerOrders; track order.id) {
                  <div class="mini-order">
                    <div class="mini-order-info">
                      <div class="mini-order-num">{{ order.orderNumber }}</div>
                      <div class="mini-order-date">{{ order.createdAt | date:'dd MMM yyyy, h:mm a' }}</div>
                    </div>
                    <div class="mini-order-right">
                      <span class="badge {{ getStatusClass(order.status) }}">{{ order.status }}</span>
                      <strong style="color:var(--burgundy);font-size:1rem">₹{{ order.totalAmount }}</strong>
                    </div>
                  </div>
                }
              </div>
              <div class="orders-summary">
                <div class="summary-item">
                  <span>Total Orders</span>
                  <strong>{{ customerOrders.length }}</strong>
                </div>
                <div class="summary-item">
                  <span>Total Spent</span>
                  <strong style="color:var(--burgundy)">₹{{ getTotalSpent() }}</strong>
                </div>
                <div class="summary-item">
                  <span>Delivered</span>
                  <strong style="color:var(--success)">{{ countDelivered() }}</strong>
                </div>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button (click)="ordersModal=false" class="btn btn-primary">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page { padding: 32px; }
    .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 20px; }
    .admin-page-header h1 { font-size: 1.8rem; }
    .admin-page-header p { color: var(--slate); margin-top: 4px; }
    .search-wrap-sm { min-width: 260px; }

    .section-card { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .section-card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 2px solid var(--cream-dark); }
    .section-card-header h2 { font-size: 1.1rem; }

    .customer-cell { display: flex; align-items: center; gap: 10px; }
    .customer-avatar {
      width: 32px; height: 32px;
      background: var(--burgundy);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 440px; box-shadow: var(--shadow-xl); animation: fadeIn 0.2s ease; max-height: 85vh; overflow-y: auto; }
    .modal-lg { max-width: 560px; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; border-bottom: 2px solid var(--cream-dark); }
    .modal-header h3 { font-size: 1.2rem; }
    .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--slate); }
    .modal-body { padding: 20px 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--cream-dark); display: flex; justify-content: flex-end; }

    .orders-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .mini-order {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--cream);
      border-radius: var(--radius-md);
    }
    .mini-order-num { font-weight: 700; font-size: 0.88rem; }
    .mini-order-date { font-size: 0.75rem; color: var(--slate); margin-top: 2px; }
    .mini-order-right { display: flex; align-items: center; gap: 12px; }

    .orders-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px;
      background: var(--cream);
      border-radius: var(--radius-md);
    }
    .summary-item { text-align: center; }
    .summary-item span { display: block; font-size: 0.75rem; color: var(--slate); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .summary-item strong { font-size: 1.1rem; color: var(--charcoal); }
  `]
})
export class CustomerManagementComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  loading = true;
  search = '';
  ordersModal = false;
  selectedCustomer: Customer | null = null;
  customerOrders: RecentOrder[] = [];
  loadingOrders = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCustomers().subscribe({
      next: r => { this.customers = r.data; this.filtered = [...r.data]; this.loading = false; },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    const s = this.search.toLowerCase();
    this.filtered = this.customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      (c.phone ?? '').includes(s)
    );
  }

  viewOrders(c: Customer) {
    this.selectedCustomer = c;
    this.customerOrders = [];
    this.loadingOrders = true;
    this.ordersModal = true;
    this.api.getCustomerOrders(c.id).subscribe({
      next: r => { this.customerOrders = r.data; this.loadingOrders = false; },
      error: () => this.loadingOrders = false
    });
  }

  getTotalSpent(): number {
    return this.customerOrders
      .filter(o => o.status === 'Delivered')
      .reduce((s, o) => s + o.totalAmount, 0);
  }

  countDelivered(): number {
    return this.customerOrders.filter(o => o.status === 'Delivered').length;
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
