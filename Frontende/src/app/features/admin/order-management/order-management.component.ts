import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus, UpdateOrderStatusDto } from '../../../core/models/models';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <div>
          <h1>Order Management</h1>
          <p>View and update all customer orders</p>
        </div>
        <button (click)="loadOrders()" class="btn btn-outline btn-sm">↺ Refresh</button>
      </div>

      <!-- Status Filter Tabs -->
      <div class="status-tabs">
        @for (tab of statusTabs; track tab.value) {
          <button (click)="filterByStatus(tab.value)" [class.active]="selectedStatus === tab.value" class="status-tab">
            {{ tab.label }}
            @if (countByStatus(tab.value) > 0) {
              <span class="tab-count">{{ countByStatus(tab.value) }}</span>
            }
          </button>
        }
      </div>

      @if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (filteredOrders.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No orders found</h3>
        </div>
      } @else {
        <div class="orders-grid fade-in">
          @for (order of filteredOrders; track order.id) {
            <div class="order-card">
              <div class="order-card-top">
                <div>
                  <div class="order-num">{{ order.orderNumber }}</div>
                  <div class="order-date">{{ order.createdAt | date:'dd MMM, h:mm a' }}</div>
                </div>
                <span class="badge {{ getStatusClass(order.status) }}">{{ order.status }}</span>
              </div>

              <div class="order-customer-row">
                <span class="customer-name">👤 {{ order.customerName }}</span>
                <span class="order-total">₹{{ order.totalAmount }}</span>
              </div>

              <div class="order-items-preview">
                @for (item of order.items.slice(0,3); track item.id) {
                  <span class="item-chip">{{ item.quantity }}× {{ item.foodItemName }}</span>
                }
                @if (order.items.length > 3) {
                  <span class="item-chip more">+{{ order.items.length - 3 }} more</span>
                }
              </div>

              <div class="order-delivery">
                <span>📍 {{ order.deliveryCity }}, {{ order.deliveryPincode }}</span>
                <span>📞 {{ order.deliveryPhone }}</span>
              </div>

              <div class="order-actions">
                <a [routerLink]="['/orders', order.id]" class="btn btn-outline btn-sm">View Details</a>
                @if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
                  <button (click)="openStatusModal(order)" class="btn btn-primary btn-sm">Update Status</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- ── STATUS UPDATE MODAL ─────────────────── -->
    @if (statusModal && selectedOrder) {
      <div class="modal-overlay" (click)="statusModal=false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Update Order Status</h3>
            <button (click)="statusModal=false" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom:16px">
              <strong>{{ selectedOrder.orderNumber }}</strong>
              <span style="margin-left:8px" class="badge {{ getStatusClass(selectedOrder.status) }}">{{ selectedOrder.status }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">New Status</label>
              <select [(ngModel)]="newStatus" class="form-control">
                @for (s of availableStatuses(selectedOrder.status); track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Remarks (optional)</label>
              <input [(ngModel)]="remarks" class="form-control" placeholder="e.g. Driver assigned, John">
            </div>
            @if (newStatus === 'Cancelled') {
              <div class="form-group">
                <label class="form-label">Cancellation Reason</label>
                <input [(ngModel)]="cancelReason" class="form-control" placeholder="Reason for cancellation">
              </div>
            }
          </div>
          <div class="modal-footer">
            <button (click)="statusModal=false" class="btn btn-outline">Cancel</button>
            <button (click)="updateStatus()" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page { padding: 32px; }
    .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .admin-page-header h1 { font-size: 1.8rem; }
    .admin-page-header p { color: var(--slate); margin-top: 4px; }

    .status-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      background: var(--white);
      padding: 12px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .status-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border: 2px solid var(--cream-dark);
      border-radius: 100px;
      background: var(--cream);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      color: var(--charcoal-mid);
    }
    .status-tab:hover, .status-tab.active { background: var(--burgundy); color: white; border-color: var(--burgundy); }
    .tab-count {
      background: rgba(255,255,255,0.25);
      color: inherit;
      padding: 1px 7px;
      border-radius: 100px;
      font-size: 0.72rem;
      font-weight: 800;
    }
    .status-tab.active .tab-count { background: rgba(255,255,255,0.3); }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .order-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: var(--transition);
    }
    .order-card:hover { box-shadow: var(--shadow-md); }
    .order-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .order-num { font-weight: 800; font-size: 0.9rem; color: var(--charcoal); }
    .order-date { font-size: 0.75rem; color: var(--slate); margin-top: 2px; }
    .order-customer-row { display: flex; justify-content: space-between; align-items: center; }
    .customer-name { font-size: 0.88rem; font-weight: 600; color: var(--charcoal-mid); }
    .order-total { font-size: 1.1rem; font-weight: 800; color: var(--burgundy); }
    .order-items-preview { display: flex; gap: 6px; flex-wrap: wrap; }
    .item-chip {
      background: var(--cream);
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.75rem;
      color: var(--charcoal-mid);
      font-weight: 500;
    }
    .item-chip.more { background: var(--cream-dark); color: var(--slate); }
    .order-delivery {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.78rem;
      color: var(--slate);
      background: var(--cream);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
    }
    .order-actions { display: flex; gap: 8px; margin-top: 4px; }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal { background: var(--white); border-radius: var(--radius-xl); width: 100%; max-width: 440px; box-shadow: var(--shadow-xl); animation: fadeIn 0.2s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 2px solid var(--cream-dark); }
    .modal-header h3 { font-size: 1.2rem; }
    .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--slate); }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--cream-dark); display: flex; justify-content: flex-end; gap: 12px; }
  `]
})
export class OrderManagementComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  selectedStatus = 'All';
  statusModal = false;
  selectedOrder: Order | null = null;
  newStatus: OrderStatus = 'Confirmed';
  remarks = '';
  cancelReason = '';
  saving = false;

  statusTabs = [
    { label: 'All',              value: 'All' },
    { label: 'Pending',          value: 'Pending' },
    { label: 'Confirmed',        value: 'Confirmed' },
    { label: 'Preparing',        value: 'Preparing' },
    { label: 'Out for Delivery', value: 'OutForDelivery' },
    { label: 'Delivered',        value: 'Delivered' },
    { label: 'Cancelled',        value: 'Cancelled' }
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: r => { this.allOrders = r.data; this.applyFilter(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    this.filteredOrders = this.selectedStatus === 'All'
      ? [...this.allOrders]
      : this.allOrders.filter(o => o.status === this.selectedStatus);
  }

  countByStatus(status: string): number {
    return status === 'All'
      ? this.allOrders.length
      : this.allOrders.filter(o => o.status === status).length;
  }

  openStatusModal(order: Order) {
    this.selectedOrder = order;
    this.remarks = '';
    this.cancelReason = '';
    const next = this.availableStatuses(order.status);
    this.newStatus = next[0] as OrderStatus;
    this.statusModal = true;
  }

  availableStatuses(current: string): string[] {
    const flow: Record<string, string[]> = {
      'Pending':        ['Confirmed', 'Cancelled'],
      'Confirmed':      ['Preparing', 'Cancelled'],
      'Preparing':      ['OutForDelivery', 'Cancelled'],
      'OutForDelivery': ['Delivered', 'Cancelled']
    };
    return flow[current] ?? [];
  }

  updateStatus() {
    if (!this.selectedOrder) return;
    this.saving = true;
    const dto: UpdateOrderStatusDto = {
      status: this.newStatus,
      changedBy: 'Admin',
      remarks: this.remarks || undefined,
      cancellationReason: this.newStatus === 'Cancelled' ? this.cancelReason : undefined
    };
    this.api.updateOrderStatus(this.selectedOrder.id, dto).subscribe({
      next: r => {
        const idx = this.allOrders.findIndex(o => o.id === this.selectedOrder!.id);
        if (idx >= 0) this.allOrders[idx] = r.data;
        this.applyFilter();
        this.toast.success(`Order updated to ${this.newStatus}`);
        this.statusModal = false;
        this.saving = false;
      },
      error: () => { this.toast.error('Failed to update status'); this.saving = false; }
    });
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
