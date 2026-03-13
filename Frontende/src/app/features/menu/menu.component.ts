import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { FoodItem, Category } from '../../core/models/models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="container">
        <h1>Our Menu</h1>
        <p>{{ filteredItems.length }} dishes available</p>
      </div>
    </div>

    <div class="container" style="padding-top:40px;padding-bottom:80px">
      <!-- ── FILTERS ──────────────────────────────────── -->
      <div class="filters-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search dishes..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            class="search-input">
        </div>

        <div class="filter-chips">
          <button
            *ngFor="let cat of categories"
            (click)="selectCategory(cat.id)"
            [class.active]="selectedCategory === cat.id"
            class="filter-chip">
            {{ getCatIcon(cat.name) }} {{ cat.name }}
          </button>
          <button
            (click)="selectCategory(null)"
            [class.active]="selectedCategory === null"
            class="filter-chip">
            All
          </button>
        </div>

        <div class="toggle-filters">
          <label class="toggle-label">
            <input type="checkbox" [(ngModel)]="vegOnly" (ngModelChange)="applyFilters()">
            <span class="toggle-track"></span>
            <span>🌿 Veg Only</span>
          </label>
        </div>
      </div>

      <!-- ── ITEMS GRID ───────────────────────────────── -->
      @if (loading) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else if (filteredItems.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🍽</div>
          <h3>No dishes found</h3>
          <p>Try adjusting your filters</p>
        </div>
      } @else {
        <div class="menu-grid">
          @for (item of filteredItems; track item.id) {
            <div class="menu-card fade-in">
              <div class="menu-card-img">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.name" loading="lazy">
                } @else {
                  <div class="img-placeholder">{{ getCatIcon(item.categoryName) }}</div>
                }
                <div class="menu-badges">
                  <span class="badge" [class]="item.isVegetarian ? 'badge-veg' : 'badge-nonveg'">
                    {{ item.isVegetarian ? '🌿 Veg' : '🍖 Non-veg' }}
                  </span>
                  @if (item.discountPrice) {
                    <span class="discount-tag">
                      {{ getDiscountPct(item.price, item.discountPrice) }}% OFF
                    </span>
                  }
                </div>
              </div>
              <div class="menu-card-body">
                <span class="cat-label">{{ item.categoryName }}</span>
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-desc">{{ item.description }}</p>
                <div class="item-meta">
                  <div class="item-rating">
                    <span class="stars">{{ getStars(item.rating) }}</span>
                    <span class="review-count">({{ item.totalReviews }})</span>
                  </div>
                  <span class="prep-time">⏱ {{ item.preparationTimeMins }}m</span>
                </div>

                <div class="item-footer">
                  <div class="item-price">
                    @if (item.discountPrice) {
                      <span class="price-old">₹{{ item.price }}</span>
                      <span class="price-new">₹{{ item.discountPrice }}</span>
                    } @else {
                      <span class="price-new">₹{{ item.price }}</span>
                    }
                  </div>

                  @if (cart.isInCart(item.id)) {
                    <div class="qty-control">
                      <button class="qty-btn" (click)="decreaseQty(item)">−</button>
                      <span class="qty-value">{{ cart.getQuantity(item.id) }}</span>
                      <button class="qty-btn" (click)="cart.addItem(item)">+</button>
                    </div>
                  } @else {
                    <button (click)="addToCart(item)" class="btn btn-primary btn-sm"
                      [disabled]="!item.isAvailable">
                      {{ item.isAvailable ? '+ Add' : 'Unavailable' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 36px;
      flex-wrap: wrap;
      background: var(--white);
      padding: 20px 24px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
    }
    .search-input {
      width: 100%;
      padding: 10px 14px 10px 40px;
      border: 2px solid var(--cream-dark);
      border-radius: var(--radius-md);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      outline: none;
      transition: var(--transition);
    }
    .search-input:focus { border-color: var(--burgundy); }

    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-chip {
      padding: 7px 14px;
      border-radius: 100px;
      border: 2px solid var(--cream-dark);
      background: var(--cream);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      color: var(--charcoal-mid);
    }
    .filter-chip:hover, .filter-chip.active {
      background: var(--burgundy);
      color: var(--white);
      border-color: var(--burgundy);
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--charcoal-mid);
      white-space: nowrap;
    }
    .toggle-label input { display: none; }
    .toggle-track {
      width: 40px;
      height: 22px;
      background: var(--cream-dark);
      border-radius: 100px;
      position: relative;
      transition: var(--transition);
    }
    .toggle-track::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 3px;
      width: 16px;
      height: 16px;
      background: var(--white);
      border-radius: 50%;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }
    .toggle-label input:checked + .toggle-track { background: var(--success); }
    .toggle-label input:checked + .toggle-track::after { left: 21px; }

    /* ── MENU GRID ─────────────────────────────────────── */
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }
    .menu-card {
      background: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }
    .menu-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
    .menu-card-img {
      height: 190px;
      position: relative;
      overflow: hidden;
      background: var(--cream-dark);
    }
    .menu-card-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder {
      width: 100%; height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      background: linear-gradient(135deg, var(--cream), var(--cream-dark));
    }
    .menu-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 6px;
      flex-direction: column;
    }
    .discount-tag {
      background: var(--gold);
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 100px;
    }
    .menu-card-body { padding: 18px; }
    .cat-label {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gold);
    }
    .item-name {
      font-size: 1.05rem;
      font-family: 'Playfair Display', serif;
      margin: 4px 0 6px;
      color: var(--charcoal);
    }
    .item-desc {
      font-size: 0.82rem;
      color: var(--slate);
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .item-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .item-rating { display: flex; align-items: center; gap: 4px; }
    .review-count { font-size: 0.75rem; color: var(--slate); }
    .prep-time { font-size: 0.78rem; color: var(--slate); }
    .item-footer { display: flex; align-items: center; justify-content: space-between; }
    .price-new { font-size: 1.15rem; font-weight: 800; color: var(--burgundy); }
    .price-old { font-size: 0.82rem; color: var(--slate); text-decoration: line-through; margin-right: 6px; }
  `]
})
export class MenuComponent implements OnInit {
  allItems: FoodItem[] = [];
  filteredItems: FoodItem[] = [];
  categories: Category[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory: number | null = null;
  vegOnly = false;

  constructor(
    private api: ApiService,
    public cart: CartService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) this.selectedCategory = +params['categoryId'];
    });
    this.api.getCategories().subscribe(r => this.categories = r.data);
    this.api.getFoodItems({ isAvailable: true }).subscribe({
      next: r => { this.allItems = r.data; this.applyFilters(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  selectCategory(id: number | null) {
    this.selectedCategory = id;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredItems = this.allItems.filter(item => {
      const matchSearch   = !this.searchTerm || item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCategory = !this.selectedCategory || item.categoryId === this.selectedCategory;
      const matchVeg      = !this.vegOnly || item.isVegetarian;
      return matchSearch && matchCategory && matchVeg;
    });
  }

  addToCart(item: FoodItem) {
    this.cart.addItem(item);
    this.toast.success(`${item.name} added to cart!`);
  }

  decreaseQty(item: FoodItem) {
    const qty = this.cart.getQuantity(item.id);
    this.cart.updateQuantity(item.id, qty - 1);
  }

  getCatIcon(name: string): string {
    const map: Record<string, string> = {
      'Starters': '🥗', 'Main Course': '🍛', 'Pizza': '🍕',
      'Burgers': '🍔', 'Desserts': '🍰', 'Beverages': '🥤'
    };
    return map[name] ?? '🍽';
  }

  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }

  getDiscountPct(price: number, discountPrice: number): number {
    return Math.round(((price - discountPrice) / price) * 100);
  }
}
