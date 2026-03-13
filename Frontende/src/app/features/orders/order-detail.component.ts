import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order, OrderStatusHistoryDto } from '../../core/models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div class="container">
        <a routerLink="/orders" class="back-link">← My Orders</a>
        <h1>Order {{ order?.orderNumber }}</h1>
        <p>Placed on {{ order?.createdAt | date:'dd MMM yyyy, h:mm a' }}</p>
      </div>
    </div>

    <div class="container" style="padding-top:40px;padding-bottom:80px">
      @if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (!order) {
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <h3>Order not found</h3>
          <a routerLink="/orders" class="btn btn-primary" style="margin-top:20px">Back to Orders</a>
        </div>
      } @else {
        <div class="detail-layout">

          <!-- ── LEFT COLUMN ─────────────────────── -->
          <div class="detail-main">

            <!-- Tracking Timeline -->
            <div class="card" style="margin-bottom:24px">
              <div class="card-body">
                <h2 style="margin-bottom:24px">Order Tracking</h2>
                <div class="timeline">
                  @for (step of allStatuses; track step.key; let last = $last) {
                    <div class="timeline-step" [class.done]="isStepDone(step.key)" [class.active]="isStepActive(step.key)">
                      <div class="step-icon-wrap">
                        <div class="step-icon">{{ step.icon }}</div>
                        @if (!last) { <div class="step-line"></div> }
                      </div>
                      <div class="step-info">
                        <div class="step-label">{{ step.label }}</div>
                        @if (getHistoryForStatus(step.key); as hist) {
                          <div class="step-time">{{ hist.createdAt | date:'h:mm a, dd MMM' }}</div>
                          @if (hist.remarks) {
                            <div class="step-remark">{{ hist.remarks }}</div>
                          }
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="card">
              <div class="card-body">
                <h2 style="margin-bottom:20px">Items Ordered</h2>
                <div class="items-list">
                  @for (item of order.items; track item.id) {
                    <div class="order-item-row">
                      <div class="item-qty-badge">{{ item.quantity }}×</div>
                      <div class="item-detail">
                        <div class="item-name">{{ item.foodItemName }}</div>
                        @if (item.specialRequest) {
                          <div class="item-note">Note: {{ item.specialRequest }}</div>
                        }
                      </div>
                      <div class="item-total">₹{{ item.totalPrice }}</div>
                    </div>
                  }
                </div>

                <div class="divider"></div>

                <div class="price-breakdown">
                  <div class="price-row"><span>Subtotal</span><span>₹{{ order.subtotal }}</span></div>
                  <div class="price-row"><span>Delivery</span><span>{{ order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge }}</span></div>
                  @if (order.discountAmount > 0) {
                    <div class="price-row discount"><span>Discount</span><span>−₹{{ order.discountAmount }}</span></div>
                  }
                  <div class="price-row total"><span>Total</span><strong>₹{{ order.totalAmount }}</strong></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── RIGHT COLUMN ────────────────────── -->
          <div class="detail-side">
            <!-- Status Card -->
            <div class="card" style="margin-bottom:20px">
              <div class="card-body">
                <h3 style="margin-bottom:12px">Order Status</h3>
                <span class="badge {{ getStatusClass(order.status) }}" style="font-size:0.85rem;padding:8px 16px">
                  {{ order.status }}
                </span>
                @if (order.estimatedDelivery && order.status !== 'Delivered' && order.status !== 'Cancelled') {
                  <div class="eta-box">
                    <span>⏱ Estimated Delivery</span>
                    <strong>{{ order.estimatedDelivery | date:'h:mm a' }}</strong>
                  </div>
                }
                @if (order.status === 'Cancelled' && order.cancellationReason) {
                  <div class="cancel-reason">
                    <span>Reason: {{ order.cancellationReason }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Delivery Info -->
            <div class="card" style="margin-bottom:20px">
              <div class="card-body">
                <h3 style="margin-bottom:12px">Delivery Details</h3>
                <div class="info-row"><span>📍</span><span>{{ order.deliveryAddress }}, {{ order.deliveryCity }} - {{ order.deliveryPincode }}</span></div>
                <div class="info-row"><span>📞</span><span>{{ order.deliveryPhone }}</span></div>
                @if (order.specialInstructions) {
                  <div class="info-row"><span>📝</span><span>{{ order.specialInstructions }}</span></div>
                }
              </div>
            </div>

            <!-- Payment Info -->
            <div class="card">
              <div class="card-body">
                <h3 style="margin-bottom:12px">Payment</h3>
                <div class="info-row"><span>💳</span><span>{{ order.paymentMethod }}</span></div>
                <div class="info-row">
                  <span>Status:</span>
                  <span [style.color]="order.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--warning)'">
                    {{ order.paymentStatus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .back-link { color: rgba(255,255,255,0.75); font-size:0.88rem; display:block; margin-bottom:8px; text-decoration:none; }
    .back-link:hover { color: var(--gold-light); }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 28px;
      align-items: start;
    }

    /* ── TIMELINE ──────────────────────────────── */
    .timeline { display: flex; flex-direction: column; }
    .timeline-step { display: flex; gap: 16px; }
    .step-icon-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .step-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--cream-dark);
      border: 3px solid var(--cream-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: var(--transition);
      color: var(--slate);
    }
    .timeline-step.done .step-icon {
      background: var(--success);
      border-color: var(--success);
      filter: none;
    }
    .timeline-step.active .step-icon {
      background: var(--burgundy);
      border-color: var(--burgundy);
      box-shadow: 0 0 0 4px rgba(107,30,46,0.15);
    }
    .step-line {
      width: 3px;
      flex: 1;
      min-height: 32px;
      background: var(--cream-dark);
      margin: 4px 0;
      border-radius: 2px;
    }
    .timeline-step.done .step-line { background: var(--success); }
    .step-info { padding: 10px 0 28px; }
    .step-label {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--charcoal-mid);
    }
    .timeline-step.done .step-label,
    .timeline-step.active .step-label { color: var(--charcoal); }
    .step-time { font-size: 0.78rem; color: var(--slate); margin-top: 2px; }
    .step-remark {
      font-size: 0.78rem;
      color: var(--gold);
      margin-top: 2px;
      font-style: italic;
    }

    /* ── ITEMS ─────────────────────────────────── */
    .items-list { display: flex; flex-direction: column; gap: 12px; }
    .order-item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--cream-dark);
    }
    .order-item-row:last-child { border-bottom: none; }
    .item-qty-badge {
      background: var(--burgundy);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      flex-shrink: 0;
    }
    .item-detail { flex: 1; }
    .item-name { font-weight: 600; font-size: 0.9rem; }
    .item-note { font-size: 0.75rem; color: var(--slate); margin-top: 2px; }
    .item-total { font-weight: 800; color: var(--burgundy); font-size: 0.95rem; }

    .price-breakdown { display: flex; flex-direction: column; gap: 8px; }
    .price-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--charcoal-mid);
    }
    .price-row.discount { color: var(--success); }
    .price-row.total {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--charcoal);
      padding-top: 8px;
      border-top: 2px solid var(--cream-dark);
      margin-top: 4px;
    }
    .price-row.total strong { color: var(--burgundy); font-size: 1.2rem; }

    /* ── SIDE ──────────────────────────────────── */
    .eta-box {
      background: var(--cream);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
      color: var(--charcoal-mid);
    }
    .eta-box strong { color: var(--burgundy); font-size: 1rem; }
    .cancel-reason {
      background: #FEE2E2;
      color: #991B1B;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      margin-top: 12px;
    }
    .info-row {
      display: flex;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--charcoal-mid);
      padding: 6px 0;
      border-bottom: 1px solid var(--cream-dark);
    }
    .info-row:last-child { border-bottom: none; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  allStatuses = [
    { key: 'Pending',        label: 'Order Placed',       icon: '📋' },
    { key: 'Confirmed',      label: 'Order Confirmed',    icon: '✅' },
    { key: 'Preparing',      label: 'Preparing Food',     icon: '👨‍🍳' },
    { key: 'OutForDelivery', label: 'Out for Delivery',   icon: '🛵' },
    { key: 'Delivered',      label: 'Delivered',          icon: '🎉' }
  ];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getOrderById(id).subscribe({
      next: r => { this.order = r.data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  isStepDone(key: string): boolean {
    if (!this.order) return false;
    const order = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered'];
    const cur   = order.indexOf(this.order.status);
    const step  = order.indexOf(key);
    return step < cur;
  }

  isStepActive(key: string): boolean {
    return this.order?.status === key;
  }

  getHistoryForStatus(status: string): OrderStatusHistoryDto | undefined {
    return this.order?.statusHistory.find(h => h.status === status);
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
