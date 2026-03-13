import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './core/services/cart.service';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- ── NAVBAR ─────────────────────────────────────────── -->
    <nav class="navbar">
      <div class="container nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🍽</span>
          <span class="brand-name">FeastFlow</span>
        </a>

        <div class="nav-links">
          <a routerLink="/"     routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/menu" routerLinkActive="active">Menu</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/orders" routerLinkActive="active">My Orders</a>
          }
        </div>

        <div class="nav-actions">
          <a routerLink="/cart" class="cart-btn">
            <span>🛒</span>
            <span>Cart</span>
            @if (cart.itemCount() > 0) {
              <span class="cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>

          @if (auth.isLoggedIn()) {
            <div class="user-chip">
              <span>👤</span>
              <span>{{ auth.customer()?.name }}</span>
              <button (click)="auth.logoutCustomer()" class="btn-icon" title="Logout">✕</button>
            </div>
          } @else {
            <a routerLink="/auth" class="btn btn-primary btn-sm">Sign In</a>
          }

          <a routerLink="/admin" class="btn btn-outline btn-sm">Admin</a>
        </div>

        <!-- Mobile menu toggle -->
        <button class="mobile-toggle" (click)="mobileOpen = !mobileOpen">☰</button>
      </div>

      <!-- Mobile Nav -->
      @if (mobileOpen) {
        <div class="mobile-nav">
          <a routerLink="/"       (click)="mobileOpen=false">Home</a>
          <a routerLink="/menu"   (click)="mobileOpen=false">Menu</a>
          <a routerLink="/cart"   (click)="mobileOpen=false">Cart ({{ cart.itemCount() }})</a>
          <a routerLink="/orders" (click)="mobileOpen=false">My Orders</a>
          <a routerLink="/auth"   (click)="mobileOpen=false">Sign In</a>
          <a routerLink="/admin"  (click)="mobileOpen=false">Admin Panel</a>
        </div>
      }
    </nav>

    <!-- ── ROUTER OUTLET ───────────────────────────────────── -->
    <main>
      <router-outlet />
    </main>

    <!-- ── FOOTER ──────────────────────────────────────────── -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="brand-icon">🍽</span>
          <span class="brand-name">FeastFlow</span>
          <p>Delicious food, delivered fast.</p>
        </div>
        <div class="footer-links">
          <a routerLink="/menu">Browse Menu</a>
          <a routerLink="/cart">Your Cart</a>
          <a routerLink="/orders">Track Orders</a>
          <a routerLink="/admin">Admin Panel</a>
        </div>
        <div class="footer-copy">
          <p>© 2025 FeastFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- ── TOAST NOTIFICATIONS ─────────────────────────────── -->
    <div class="toast-container">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}">
          <span>{{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}</span>
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── NAVBAR ───────────────────────────────────────── */
    .navbar {
      background: var(--white);
      border-bottom: 2px solid var(--cream-dark);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      gap: 32px;
      height: 68px;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-icon { font-size: 1.6rem; }
    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--burgundy);
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      gap: 28px;
      flex: 1;
    }
    .nav-links a {
      color: var(--charcoal-mid);
      font-weight: 500;
      font-size: 0.92rem;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: var(--transition);
      text-decoration: none;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--burgundy);
      border-bottom-color: var(--burgundy);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cart-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--cream);
      border-radius: var(--radius-md);
      color: var(--charcoal);
      font-weight: 600;
      font-size: 0.88rem;
      text-decoration: none;
      position: relative;
      transition: var(--transition);
    }
    .cart-btn:hover { background: var(--cream-dark); color: var(--burgundy); }
    .cart-badge {
      background: var(--burgundy);
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--cream);
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--charcoal-mid);
    }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--slate);
      font-size: 0.75rem;
      padding: 2px;
      transition: var(--transition);
    }
    .btn-icon:hover { color: var(--burgundy); }
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
      color: var(--charcoal);
      margin-left: auto;
    }
    .mobile-nav {
      background: var(--white);
      border-top: 1px solid var(--cream-dark);
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mobile-nav a {
      padding: 10px 0;
      font-weight: 500;
      color: var(--charcoal-mid);
      border-bottom: 1px solid var(--cream-dark);
      text-decoration: none;
    }
    .mobile-nav a:last-child { border-bottom: none; }

    /* ── FOOTER ───────────────────────────────────────── */
    .footer {
      background: var(--burgundy-dark);
      color: rgba(255,255,255,0.8);
      padding: 48px 0 24px;
      margin-top: 80px;
    }
    .footer-inner {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;
      align-items: start;
    }
    .footer-brand .brand-name { color: var(--white); }
    .footer-brand p { color: rgba(255,255,255,0.6); margin-top: 8px; font-size: 0.9rem; }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-links a {
      color: rgba(255,255,255,0.7);
      font-size: 0.9rem;
      text-decoration: none;
      transition: var(--transition);
    }
    .footer-links a:hover { color: var(--gold-light); }
    .footer-copy { text-align: right; font-size: 0.8rem; color: rgba(255,255,255,0.4); }

    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .mobile-toggle { display: block; }
      .footer-inner { grid-template-columns: 1fr; }
      .footer-copy { text-align: left; }
    }
  `]
})
export class AppComponent {
  mobileOpen = false;
  constructor(
    public cart: CartService,
    public auth: AuthService,
    public toastSvc: ToastService
  ) {}
}
