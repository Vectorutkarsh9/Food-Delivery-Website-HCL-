import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  template: `
    <!-- Admin Login Gate -->
    @if (!auth.isAdminIn()) {
      <div class="admin-login-wrap">
        <div class="admin-login-card">
          <div class="admin-login-header">
            <span style="font-size:2.5rem">🔐</span>
            <h2>Admin Access</h2>
            <p>Sign in to manage your restaurant</p>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input [(ngModel)]="email" type="email" class="form-control" placeholder="admin@fooddelivery.com">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input [(ngModel)]="password" type="password" class="form-control" placeholder="Password" (keyup.enter)="login()">
          </div>
          <button (click)="login()" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Admin Sign In →' }}
          </button>
          <p style="text-align:center;margin-top:16px;font-size:0.8rem;color:var(--slate)">
            Default: admin&#64;fooddelivery.com
          </p>
        </div>
      </div>
    } @else {
      <!-- Admin Shell -->
      <div class="admin-shell">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <span>🍽</span>
            <div>
              <div class="brand-title">FeastFlow</div>
              <div class="brand-sub">Admin Panel</div>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📊</span>
              <span>Dashboard</span>
            </a>
            <a routerLink="/admin/menu" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">🍽</span>
              <span>Menu Management</span>
            </a>
            <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📦</span>
              <span>Orders</span>
            </a>
            <a routerLink="/admin/customers" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">👥</span>
              <span>Customers</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="admin-user">
              <div class="admin-avatar">{{ auth.admin()?.name?.charAt(0) }}</div>
              <div>
                <div class="admin-name">{{ auth.admin()?.name }}</div>
                <div class="admin-role">Administrator</div>
              </div>
            </div>
            <button (click)="logout()" class="logout-btn" title="Logout">⏻</button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
          <router-outlet />
        </main>
      </div>
    }
  `,
  styles: [`
    /* ── LOGIN ────────────────────────────────────── */
    .admin-login-wrap {
      min-height: calc(100vh - 68px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--burgundy-dark), var(--burgundy));
      padding: 40px 20px;
    }
    .admin-login-card {
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 44px;
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-xl);
    }
    .admin-login-header { text-align: center; margin-bottom: 32px; }
    .admin-login-header h2 { font-size: 1.8rem; margin: 12px 0 6px; }
    .admin-login-header p { color: var(--slate); font-size: 0.9rem; }

    /* ── ADMIN SHELL ──────────────────────────────── */
    .admin-shell {
      display: flex;
      min-height: calc(100vh - 68px);
    }

    /* ── SIDEBAR ──────────────────────────────────── */
    .sidebar {
      width: 260px;
      background: var(--burgundy-dark);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 68px;
      height: calc(100vh - 68px);
      overflow-y: auto;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 28px 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 1.6rem;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--white);
    }
    .brand-sub { font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }

    .sidebar-nav { flex: 1; padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      color: rgba(255,255,255,0.65);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition);
    }
    .nav-item:hover { background: rgba(255,255,255,0.08); color: var(--white); }
    .nav-item.active { background: rgba(255,255,255,0.14); color: var(--white); font-weight: 700; }
    .nav-icon { font-size: 1.1rem; width: 24px; text-align: center; }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .admin-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .admin-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gold);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: var(--white);
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .admin-name {
      font-size: 0.85rem;
      color: var(--white);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .admin-role { font-size: 0.72rem; color: rgba(255,255,255,0.45); }
    .logout-btn {
      background: rgba(255,255,255,0.08);
      border: none;
      color: rgba(255,255,255,0.6);
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 1rem;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logout-btn:hover { background: rgba(255,0,0,0.2); color: #FF6B6B; }

    /* ── MAIN ─────────────────────────────────────── */
    .admin-main {
      flex: 1;
      background: var(--cream);
      overflow-y: auto;
      min-height: calc(100vh - 68px);
    }

    @media (max-width: 768px) {
      .sidebar { width: 60px; }
      .brand-title, .brand-sub, .nav-item span:last-child, .admin-name, .admin-role { display: none; }
      .nav-item { justify-content: center; padding: 12px; }
      .sidebar-brand { justify-content: center; padding: 20px 12px; }
    }
  `]
})
export class AdminLayoutComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) { this.toast.error('Enter email and password'); return; }
    this.loading = true;
    this.api.adminLogin({ email: this.email, password: this.password }).subscribe({
      next: r => {
        this.auth.setAdmin(r.data);
        this.toast.success(`Welcome, ${r.data.name}!`);
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => { this.toast.error('Invalid credentials'); this.loading = false; }
    });
  }

  logout() {
    this.auth.logoutAdmin();
    this.toast.info('Logged out');
    this.router.navigate(['/admin']);
  }
}
