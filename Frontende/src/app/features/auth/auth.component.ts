import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="auth-brand">
          <span style="font-size:3rem">🍽</span>
          <h1>FeastFlow</h1>
          <p>Delicious food, delivered fast.</p>
        </div>
        <div class="auth-features">
          <div class="auth-feature"><span>✅</span><span>30-minute delivery</span></div>
          <div class="auth-feature"><span>✅</span><span>Fresh ingredients daily</span></div>
          <div class="auth-feature"><span>✅</span><span>Real-time order tracking</span></div>
          <div class="auth-feature"><span>✅</span><span>Secure payments</span></div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <!-- Tab Toggle -->
          <div class="auth-tabs">
            <button [class.active]="mode === 'login'"    (click)="mode='login'">Sign In</button>
            <button [class.active]="mode === 'register'" (click)="mode='register'">Register</button>
          </div>

          <!-- LOGIN -->
          @if (mode === 'login') {
            <div class="fade-in">
              <h2>Welcome back</h2>
              <p class="auth-subtitle">Sign in to your account</p>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input [(ngModel)]="loginEmail" type="email" class="form-control" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input [(ngModel)]="loginPassword" type="password" class="form-control" placeholder="Your password">
              </div>
              <button (click)="login()" class="btn btn-primary auth-btn" [disabled]="loading">
                {{ loading ? 'Signing in...' : 'Sign In →' }}
              </button>
              <p class="auth-switch">
                Don't have an account?
                <a (click)="mode='register'" class="auth-link">Register here</a>
              </p>
            </div>
          }

          <!-- REGISTER -->
          @if (mode === 'register') {
            <div class="fade-in">
              <h2>Create account</h2>
              <p class="auth-subtitle">Join thousands of happy customers</p>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input [(ngModel)]="reg.name" class="form-control" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input [(ngModel)]="reg.email" type="email" class="form-control" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input [(ngModel)]="reg.password" type="password" class="form-control" placeholder="Min 6 characters">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input [(ngModel)]="reg.phone" class="form-control" placeholder="Mobile number">
                </div>
                <div class="form-group">
                  <label class="form-label">City</label>
                  <input [(ngModel)]="reg.city" class="form-control" placeholder="Your city">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input [(ngModel)]="reg.address" class="form-control" placeholder="Delivery address">
              </div>
              <button (click)="register()" class="btn btn-primary auth-btn" [disabled]="loading">
                {{ loading ? 'Creating account...' : 'Create Account →' }}
              </button>
              <p class="auth-switch">
                Already have an account?
                <a (click)="mode='login'" class="auth-link">Sign in</a>
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 68px);
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .auth-left {
      background: linear-gradient(135deg, var(--burgundy-dark) 0%, var(--burgundy) 60%, var(--burgundy-light) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 60px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute;
      top: -30%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(201,150,42,0.18) 0%, transparent 70%);
    }
    .auth-brand { margin-bottom: 48px; }
    .auth-brand h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.8rem;
      color: var(--white);
      margin: 12px 0 8px;
    }
    .auth-brand p { color: rgba(255,255,255,0.65); font-size: 1.05rem; }
    .auth-features { display: flex; flex-direction: column; gap: 16px; }
    .auth-feature {
      display: flex;
      align-items: center;
      gap: 14px;
      color: rgba(255,255,255,0.85);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .auth-right {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
      background: var(--cream);
    }
    .auth-card {
      background: var(--white);
      border-radius: var(--radius-xl);
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: var(--shadow-xl);
    }
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: var(--cream);
      border-radius: var(--radius-md);
      padding: 4px;
      margin-bottom: 28px;
    }
    .auth-tabs button {
      padding: 10px;
      border: none;
      background: transparent;
      border-radius: calc(var(--radius-md) - 4px);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--slate);
      cursor: pointer;
      transition: var(--transition);
    }
    .auth-tabs button.active {
      background: var(--white);
      color: var(--burgundy);
      box-shadow: var(--shadow-sm);
    }
    .auth-card h2 {
      font-size: 1.6rem;
      color: var(--charcoal);
      margin-bottom: 4px;
    }
    .auth-subtitle { color: var(--slate); font-size: 0.9rem; margin-bottom: 24px; }
    .auth-btn { width: 100%; justify-content: center; margin-top: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .auth-switch { text-align: center; margin-top: 16px; font-size: 0.88rem; color: var(--slate); }
    .auth-link {
      color: var(--burgundy);
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
    }
    .auth-link:hover { color: var(--gold); }

    @media (max-width: 768px) {
      .auth-wrapper { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 40px 20px; }
    }
  `]
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  loginEmail = '';
  loginPassword = '';
  reg = { name: '', email: '', password: '', phone: '', city: '', address: '', pincode: '' };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  login() {
    if (!this.loginEmail || !this.loginPassword) {
      this.toast.error('Please fill in all fields'); return;
    }
    this.loading = true;
    this.api.loginCustomer({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: r => {
        this.auth.setCustomer(r.data);
        this.toast.success(`Welcome back, ${r.data.name}!`);
        this.router.navigate(['/menu']);
      },
      error: () => { this.toast.error('Invalid email or password'); this.loading = false; }
    });
  }

  register() {
    if (!this.reg.name || !this.reg.email || !this.reg.password) {
      this.toast.error('Name, email and password are required'); return;
    }
    this.loading = true;
    this.api.registerCustomer(this.reg).subscribe({
      next: r => {
        this.auth.setCustomer(r.data);
        this.toast.success('Account created! Welcome to FeastFlow 🎉');
        this.router.navigate(['/menu']);
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Registration failed');
        this.loading = false;
      }
    });
  }
}
