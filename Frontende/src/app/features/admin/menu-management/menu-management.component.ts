import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { FoodItem, Category, CreateFoodItemDto } from '../../../core/models/models';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page-header">
        <div>
          <h1>Menu Management</h1>
          <p>Add, edit and manage your food items and categories</p>
        </div>
        <div style="display:flex;gap:10px">
          <button (click)="showTab='categories'" class="btn {{ showTab === 'categories' ? 'btn-primary' : 'btn-outline' }} btn-sm">
            Categories
          </button>
          <button (click)="showTab='items'" class="btn {{ showTab === 'items' ? 'btn-primary' : 'btn-outline' }} btn-sm">
            Food Items
          </button>
          <button (click)="openItemForm()" class="btn btn-gold btn-sm">+ Add Item</button>
        </div>
      </div>

      <!-- ── CATEGORIES TAB ─────────────────────────── -->
      @if (showTab === 'categories') {
        <div class="section-card fade-in">
          <div class="section-card-header">
            <h2>Categories ({{ categories.length }})</h2>
            <button (click)="openCatForm()" class="btn btn-primary btn-sm">+ Add Category</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                @for (cat of categories; track cat.id) {
                  <tr>
                    <td>{{ cat.id }}</td>
                    <td><strong>{{ cat.name }}</strong></td>
                    <td>{{ cat.description || '—' }}</td>
                    <td>{{ cat.displayOrder }}</td>
                    <td>
                      <span class="badge {{ cat.isActive ? 'badge-delivered' : 'badge-cancelled' }}">
                        {{ cat.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:8px">
                        <button (click)="editCategory(cat)" class="btn btn-outline btn-sm">Edit</button>
                        <button (click)="deleteCategory(cat.id)" class="btn-danger-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ── FOOD ITEMS TAB ──────────────────────────── -->
      @if (showTab === 'items') {
        <!-- Filter bar -->
        <div class="filter-row">
          <select [(ngModel)]="filterCategoryId" (ngModelChange)="loadItems()" class="form-control" style="width:180px">
            <option [ngValue]="null">All Categories</option>
            @for (cat of categories; track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
          <input [(ngModel)]="searchItem" (ngModelChange)="applyItemFilter()"
            placeholder="Search items..." class="form-control" style="width:220px">
        </div>

        <div class="section-card fade-in">
          <div class="section-card-header">
            <h2>Food Items ({{ filteredItems.length }})</h2>
          </div>
          @if (loadingItems) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr><th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Veg</th><th>Available</th><th>Rating</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  @for (item of filteredItems; track item.id) {
                    <tr>
                      <td>{{ item.id }}</td>
                      <td>
                        <div style="font-weight:600">{{ item.name }}</div>
                        @if (item.discountPrice) {
                          <div style="font-size:0.75rem;color:var(--success)">Sale: ₹{{ item.discountPrice }}</div>
                        }
                      </td>
                      <td>{{ item.categoryName }}</td>
                      <td><strong>₹{{ item.price }}</strong></td>
                      <td>
                        <span class="badge {{ item.isVegetarian ? 'badge-veg' : 'badge-nonveg' }}">
                          {{ item.isVegetarian ? '🌿' : '🍖' }}
                        </span>
                      </td>
                      <td>
                        <button (click)="toggleAvailability(item)" class="toggle-avail"
                          [class.on]="item.isAvailable">
                          {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                        </button>
                      </td>
                      <td>
                        <span class="stars" style="font-size:0.8rem">{{ getStars(item.rating) }}</span>
                        <span style="font-size:0.75rem;color:var(--slate)"> ({{ item.totalReviews }})</span>
                      </td>
                      <td>
                        <div style="display:flex;gap:8px">
                          <button (click)="editItem(item)" class="btn btn-outline btn-sm">Edit</button>
                          <button (click)="deleteItem(item.id)" class="btn-danger-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>

    <!-- ── CATEGORY MODAL ──────────────────────────── -->
    @if (catModal) {
      <div class="modal-overlay" (click)="catModal=false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingCat ? 'Edit' : 'Add' }} Category</h3>
            <button (click)="catModal=false" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input [(ngModel)]="catForm.name" class="form-control" placeholder="e.g. Pizza">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input [(ngModel)]="catForm.description" class="form-control" placeholder="Short description">
            </div>
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input [(ngModel)]="catForm.imageUrl" class="form-control" placeholder="https://...">
            </div>
            <div class="form-group">
              <label class="form-label">Display Order</label>
              <input [(ngModel)]="catForm.displayOrder" type="number" class="form-control">
            </div>
            @if (editingCat) {
              <div class="form-group">
                <label class="form-label">Status</label>
                <select [(ngModel)]="catForm.isActive" class="form-control">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button (click)="catModal=false" class="btn btn-outline">Cancel</button>
            <button (click)="saveCategory()" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Category' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── FOOD ITEM MODAL ─────────────────────────── -->
    @if (itemModal) {
      <div class="modal-overlay" (click)="itemModal=false">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingItem ? 'Edit' : 'Add' }} Food Item</h3>
            <button (click)="itemModal=false" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input [(ngModel)]="itemForm.name" class="form-control" placeholder="Item name">
              </div>
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select [(ngModel)]="itemForm.categoryId" class="form-control">
                  <option [ngValue]="0">Select category</option>
                  @for (cat of categories; track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea [(ngModel)]="itemForm.description" class="form-control" rows="2" placeholder="Brief description"></textarea>
            </div>
            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label">Price (₹) *</label>
                <input [(ngModel)]="itemForm.price" type="number" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Discount Price (₹)</label>
                <input [(ngModel)]="itemForm.discountPrice" type="number" class="form-control" placeholder="Optional">
              </div>
              <div class="form-group">
                <label class="form-label">Prep Time (mins)</label>
                <input [(ngModel)]="itemForm.preparationTimeMins" type="number" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input [(ngModel)]="itemForm.imageUrl" class="form-control" placeholder="https://...">
            </div>
            <div class="form-row-3">
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="itemForm.isVegetarian">
                <span>🌿 Vegetarian</span>
              </label>
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="itemForm.isVegan">
                <span>🌱 Vegan</span>
              </label>
              @if (editingItem) {
                <label class="check-label">
                  <input type="checkbox" [(ngModel)]="itemForm.isAvailable">
                  <span>✅ Available</span>
                </label>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button (click)="itemModal=false" class="btn btn-outline">Cancel</button>
            <button (click)="saveItem()" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Item' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page { padding: 32px; }
    .admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .admin-page-header h1 { font-size: 1.8rem; }
    .admin-page-header p { color: var(--slate); margin-top: 4px; }

    .filter-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }

    .section-card { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 24px; }
    .section-card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 2px solid var(--cream-dark); }
    .section-card-header h2 { font-size: 1.1rem; }

    .toggle-avail {
      padding: 4px 12px;
      border-radius: 100px;
      border: none;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      background: #FEE2E2;
      color: #991B1B;
    }
    .toggle-avail.on { background: #D1FAE5; color: #065F46; }

    .btn-danger-sm {
      padding: 6px 12px;
      background: #FEE2E2;
      color: #991B1B;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-danger-sm:hover { background: #991B1B; color: white; }

    /* ── MODAL ─────────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(4px);
    }
    .modal {
      background: var(--white);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-xl);
      animation: fadeIn 0.2s ease;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-lg { max-width: 620px; }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 2px solid var(--cream-dark);
    }
    .modal-header h3 { font-size: 1.2rem; }
    .modal-close { background: none; border: none; font-size: 1rem; cursor: pointer; color: var(--slate); padding: 4px; }
    .modal-close:hover { color: var(--burgundy); }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--cream-dark); display: flex; justify-content: flex-end; gap: 12px; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .check-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--charcoal-mid);
      cursor: pointer;
      padding: 10px 0;
    }
  `]
})
export class MenuManagementComponent implements OnInit {
  categories: Category[] = [];
  allItems: FoodItem[] = [];
  filteredItems: FoodItem[] = [];
  showTab = 'items';
  loadingItems = true;
  filterCategoryId: number | null = null;
  searchItem = '';
  saving = false;

  catModal = false;
  itemModal = false;
  editingCat: Category | null = null;
  editingItem: FoodItem | null = null;

  catForm: any  = { name: '', description: '', imageUrl: '', displayOrder: 0, isActive: true };
  itemForm: any = { categoryId: 0, name: '', description: '', price: 0, discountPrice: null, imageUrl: '', isVegetarian: false, isVegan: false, preparationTimeMins: 15, isAvailable: true };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.getCategories().subscribe(r => this.categories = r.data);
    this.loadItems();
  }

  loadItems() {
    this.loadingItems = true;
    const filters = this.filterCategoryId ? { categoryId: this.filterCategoryId } : {};
    this.api.getFoodItems(filters).subscribe({
      next: r => { this.allItems = r.data; this.applyItemFilter(); this.loadingItems = false; },
      error: () => this.loadingItems = false
    });
  }

  applyItemFilter() {
    this.filteredItems = this.searchItem
      ? this.allItems.filter(i => i.name.toLowerCase().includes(this.searchItem.toLowerCase()))
      : [...this.allItems];
  }

  // ── CATEGORY CRUD ──────────────────────────────
  openCatForm() {
    this.editingCat = null;
    this.catForm = { name: '', description: '', imageUrl: '', displayOrder: 0, isActive: true };
    this.catModal = true;
  }
  editCategory(cat: Category) {
    this.editingCat = cat;
    this.catForm = { name: cat.name, description: cat.description, imageUrl: cat.imageUrl, displayOrder: cat.displayOrder, isActive: cat.isActive };
    this.catModal = true;
  }
  saveCategory() {
    if (!this.catForm.name) { this.toast.error('Name is required'); return; }
    this.saving = true;
    const call = this.editingCat
      ? this.api.updateCategory(this.editingCat.id, this.catForm)
      : this.api.createCategory(this.catForm);
    call.subscribe({
      next: () => {
        this.toast.success(`Category ${this.editingCat ? 'updated' : 'created'}!`);
        this.catModal = false; this.saving = false;
        this.api.getCategories().subscribe(r => this.categories = r.data);
      },
      error: (e) => { this.toast.error(e?.error?.message || 'Error saving category'); this.saving = false; }
    });
  }
  deleteCategory(id: number) {
    if (!confirm('Delete this category?')) return;
    this.api.deleteCategory(id).subscribe({
      next: () => { this.toast.success('Category deleted'); this.api.getCategories().subscribe(r => this.categories = r.data); },
      error: (e) => this.toast.error(e?.error?.message || 'Cannot delete category')
    });
  }

  // ── FOOD ITEM CRUD ──────────────────────────────
  openItemForm() {
    this.editingItem = null;
    this.itemForm = { categoryId: 0, name: '', description: '', price: 0, discountPrice: null, imageUrl: '', isVegetarian: false, isVegan: false, preparationTimeMins: 15, isAvailable: true };
    this.itemModal = true;
  }
  editItem(item: FoodItem) {
    this.editingItem = item;
    this.itemForm = { ...item };
    this.itemModal = true;
  }
  saveItem() {
    if (!this.itemForm.name || !this.itemForm.categoryId || !this.itemForm.price) {
      this.toast.error('Name, category and price are required'); return;
    }
    this.saving = true;
    const call = this.editingItem
      ? this.api.updateFoodItem(this.editingItem.id, this.itemForm)
      : this.api.createFoodItem(this.itemForm);
    call.subscribe({
      next: () => {
        this.toast.success(`Item ${this.editingItem ? 'updated' : 'created'}!`);
        this.itemModal = false; this.saving = false; this.loadItems();
      },
      error: (e) => { this.toast.error(e?.error?.message || 'Error saving item'); this.saving = false; }
    });
  }
  deleteItem(id: number) {
    if (!confirm('Delete this food item?')) return;
    this.api.deleteFoodItem(id).subscribe({
      next: () => { this.toast.success('Item deleted'); this.loadItems(); },
      error: (e) => this.toast.error(e?.error?.message || 'Cannot delete item')
    });
  }
  toggleAvailability(item: FoodItem) {
    this.api.toggleFoodItemAvailability(item.id).subscribe({
      next: r => { item.isAvailable = r.data.isAvailable; this.toast.success(`Item marked as ${r.data.isAvailable ? 'Available' : 'Unavailable'}`); },
      error: () => this.toast.error('Failed to toggle availability')
    });
  }

  getStars(r: number): string { return '★'.repeat(Math.floor(r)) + '☆'.repeat(5 - Math.floor(r)); }
}
