import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { FoodItem, Category } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ── HERO ───────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-inner">
        <div class="hero-content fade-in">
          <div class="hero-tag">🔥 Hot & Fresh</div>
          <h1 class="hero-title">
            Extraordinary<br>
            <span class="hero-accent">Food</span> Delivered<br>
            To Your Door
          </h1>
          <p class="hero-sub">
            Curated menus from the finest kitchens.<br>
            Fast delivery, every time.
          </p>
          <div class="hero-cta">
            <a routerLink="/menu" class="btn btn-gold btn-lg">
              Explore Menu →
            </a>
            <a routerLink="/auth" class="btn btn-outline btn-lg" style="color:white;border-color:rgba(255,255,255,0.5)">
              Sign In
            </a>
          </div>
          <div class="hero-stats">
            <div class="stat"><strong>50+</strong><span>Menu Items</span></div>
            <div class="stat-divider"></div>
            <div class="stat"><strong>30 min</strong><span>Avg Delivery</span></div>
            <div class="stat-divider"></div>
            <div class="stat"><strong>4.8★</strong><span>Avg Rating</span></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-plate">🍽️</div>
          <div class="float-badge badge-1">🍕 Pizza</div>
          <div class="float-badge badge-2">🍔 Burgers</div>
          <div class="float-badge badge-3">🥗 Healthy</div>
        </div>
      </div>
    </section>

    <!-- ── CATEGORIES ─────────────────────────────────────── -->
    <section class="section-sm">
      <div class="container">
        <h2 class="section-title">Browse by Category</h2>
        @if (loadingCats) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="categories-row">
            @for (cat of categories; track cat.id) {
              <a routerLink="/menu" [queryParams]="{categoryId: cat.id}" class="cat-chip">
                <span class="cat-icon">{{ getCatIcon(cat.name) }}</span>
                <span>{{ cat.name }}</span>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- ── FEATURED ITEMS ─────────────────────────────────── -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Dishes</h2>
          <a routerLink="/menu" class="view-all">View All →</a>
        </div>
        @if (loadingItems) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else {
          <div class="grid-4">
            @for (item of featuredItems; track item.id) {
              <div class="food-card fade-in">
                <div class="food-card-img">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" loading="lazy">
                  } @else {
                    <div class="img-placeholder">{{ getFoodEmoji(item.categoryName) }}</div>
                  }
                  <span class="food-badge" [class]="item.isVegetarian ? 'badge-veg' : 'badge-nonveg'">
                    {{ item.isVegetarian ? '🌿 Veg' : '🍖 Non-veg' }}
                  </span>
                </div>
                <div class="food-card-body">
                  <div class="food-category">{{ item.categoryName }}</div>
                  <h3 class="food-name">{{ item.name }}</h3>
                  <p class="food-desc">{{ item.description }}</p>
                  <div class="food-meta">
                    <span class="stars">{{ getStars(item.rating) }}</span>
                    <span class="food-time">⏱ {{ item.preparationTimeMins }}min</span>
                  </div>
                  <div class="food-footer">
                    <div class="food-price">
                      @if (item.discountPrice) {
                        <span class="price-original">₹{{ item.price }}</span>
                        <span class="price-current">₹{{ item.discountPrice }}</span>
                      } @else {
                        <span class="price-current">₹{{ item.price }}</span>
                      }
                    </div>
                    <button (click)="addToCart(item)" class="btn btn-primary btn-sm"
                      [disabled]="!item.isAvailable">
                      {{ cart.isInCart(item.id) ? '✓ Added' : '+ Add' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- ── WHY US ──────────────────────────────────────────── -->
    <section class="why-section">
      <div class="container">
        <h2 class="section-title" style="text-align:center;color:white">Why FeastFlow?</h2>
        <div class="grid-3" style="margin-top:48px">
          @for (f of features; track f.icon) {
            <div class="feature-card">
              <div class="feature-icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── HERO ─────────────────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, var(--burgundy-dark) 0%, var(--burgundy) 50%, #8B2A40 100%);
      min-height: 88vh;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(201,150,42,0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%);
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
      padding: 80px 24px;
      position: relative;
      z-index: 1;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(201,150,42,0.2);
      color: var(--gold-light);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 20px;
      border: 1px solid rgba(201,150,42,0.3);
    }
    .hero-title {
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      color: var(--white);
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero-accent { color: var(--gold-light); }
    .hero-sub {
      color: rgba(255,255,255,0.75);
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 36px;
    }
    .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 48px; }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .stat { display: flex; flex-direction: column; }
    .stat strong { color: var(--white); font-size: 1.4rem; font-family: 'Playfair Display', serif; }
    .stat span { color: rgba(255,255,255,0.6); font-size: 0.8rem; }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.2); }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .hero-plate {
      font-size: 10rem;
      filter: drop-shadow(0 20px 60px rgba(0,0,0,0.3));
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-20px); }
    }
    .float-badge {
      position: absolute;
      background: var(--white);
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: var(--shadow-md);
      color: var(--charcoal);
    }
    .badge-1 { top: 10%; left: 5%; animation: float 3.5s 0.5s ease-in-out infinite; }
    .badge-2 { bottom: 15%; left: 0%; animation: float 4.5s 1s ease-in-out infinite; }
    .badge-3 { top: 15%; right: 5%; animation: float 3s 0.2s ease-in-out infinite; }

    /* ── CATEGORIES ───────────────────────────────────── */
    .section-title {
      font-size: 2rem;
      color: var(--charcoal);
      margin-bottom: 32px;
    }
    .categories-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .cat-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--white);
      border-radius: 100px;
      border: 2px solid var(--cream-dark);
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--charcoal-mid);
      text-decoration: none;
      transition: var(--transition-bounce);
    }
    .cat-chip:hover {
      background: var(--burgundy);
      color: var(--white);
      border-color: var(--burgundy);
      transform: translateY(-3px);
    }
    .cat-icon { font-size: 1.2rem; }

    /* ── FOOD CARD ─────────────────────────────────────── */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .view-all {
      color: var(--burgundy);
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      transition: var(--transition);
    }
    .view-all:hover { color: var(--gold); }

    .food-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .food-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
    .food-card-img {
      height: 180px;
      background: var(--cream-dark);
      position: relative;
      overflow: hidden;
    }
    .food-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder {
      width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      background: linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%);
    }
    .food-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .food-card-body { padding: 16px; }
    .food-category {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gold);
      margin-bottom: 4px;
    }
    .food-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--charcoal);
      margin-bottom: 6px;
      font-family: 'Playfair Display', serif;
    }
    .food-desc {
      font-size: 0.82rem;
      color: var(--slate);
      line-height: 1.5;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .food-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .food-time { font-size: 0.78rem; color: var(--slate); }
    .food-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price-current { font-size: 1.15rem; font-weight: 800; color: var(--burgundy); }
    .price-original { font-size: 0.85rem; color: var(--slate); text-decoration: line-through; margin-right: 6px; }

    /* ── WHY SECTION ──────────────────────────────────── */
    .why-section {
      background: linear-gradient(135deg, var(--burgundy-dark), var(--burgundy));
      padding: 80px 0;
    }
    .feature-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: var(--radius-lg);
      padding: 36px 28px;
      text-align: center;
      transition: var(--transition);
    }
    .feature-card:hover {
      background: rgba(255,255,255,0.14);
      transform: translateY(-6px);
    }
    .feature-icon { font-size: 3rem; margin-bottom: 16px; }
    .feature-card h3 { color: var(--white); margin-bottom: 10px; font-size: 1.2rem; }
    .feature-card p { color: rgba(255,255,255,0.65); font-size: 0.9rem; line-height: 1.6; }

    @media (max-width: 768px) {
      .hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
      .hero-visual { display: none; }
      .hero-cta { justify-content: center; }
      .hero-stats { justify-content: center; }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredItems: FoodItem[] = [];
  loadingCats  = true;
  loadingItems = true;

  features = [
    { icon: '⚡', title: 'Lightning Fast',  desc: 'Average delivery in under 30 minutes. We never keep you waiting.' },
    { icon: '👨‍🍳', title: 'Chef Curated',   desc: 'Every dish crafted by experienced chefs with premium ingredients.' },
    { icon: '🔒', title: 'Safe & Secure',   desc: 'Contactless delivery and secure payments for your peace of mind.' }
  ];

  constructor(
    private api: ApiService,
    public cart: CartService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: r => { this.categories = r.data; this.loadingCats = false; },
      error: () => this.loadingCats = false
    });
    this.api.getFoodItems({ isAvailable: true }).subscribe({
      next: r => { this.featuredItems = r.data.slice(0, 8); this.loadingItems = false; },
      error: () => this.loadingItems = false
    });
  }

  addToCart(item: FoodItem) {
    this.cart.addItem(item);
    this.toast.success(`${item.name} added to cart!`);
  }

  getCatIcon(name: string): string {
    const map: Record<string, string> = {
      'Starters': '🥗', 'Main Course': '🍛', 'Pizza': '🍕',
      'Burgers': '🍔', 'Desserts': '🍰', 'Beverages': '🥤'
    };
    return map[name] ?? '🍽';
  }

  getFoodEmoji(category: string): string {
    return this.getCatIcon(category);
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
}
