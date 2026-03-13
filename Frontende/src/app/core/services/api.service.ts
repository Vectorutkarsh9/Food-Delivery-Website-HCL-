import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, Category, CreateCategoryDto, FoodItem, CreateFoodItemDto,
  UpdateFoodItemDto, Customer, RegisterCustomerDto, LoginDto,
  Order, CreateOrderDto, UpdateOrderStatusDto, OrderStatusHistoryDto,
  Review, CreateReviewDto, Admin, DashboardStats, RecentOrder
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // ── CATEGORIES ────────────────────────────────────────────
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.base}/categories`);
  }
  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.base}/categories/${id}`);
  }
  createCategory(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.base}/categories`, dto);
  }
  updateCategory(id: number, dto: any): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.base}/categories/${id}`, dto);
  }
  deleteCategory(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/categories/${id}`);
  }

  // ── FOOD ITEMS ────────────────────────────────────────────
  getFoodItems(filters?: { categoryId?: number; isVegetarian?: boolean; isAvailable?: boolean }): Observable<ApiResponse<FoodItem[]>> {
    let params = new HttpParams();
    if (filters?.categoryId   != null) params = params.set('categoryId',   filters.categoryId);
    if (filters?.isVegetarian != null) params = params.set('isVegetarian', filters.isVegetarian);
    if (filters?.isAvailable  != null) params = params.set('isAvailable',  filters.isAvailable);
    return this.http.get<ApiResponse<FoodItem[]>>(`${this.base}/fooditems`, { params });
  }
  getFoodItemById(id: number): Observable<ApiResponse<FoodItem>> {
    return this.http.get<ApiResponse<FoodItem>>(`${this.base}/fooditems/${id}`);
  }
  createFoodItem(dto: CreateFoodItemDto): Observable<ApiResponse<FoodItem>> {
    return this.http.post<ApiResponse<FoodItem>>(`${this.base}/fooditems`, dto);
  }
  updateFoodItem(id: number, dto: UpdateFoodItemDto): Observable<ApiResponse<FoodItem>> {
    return this.http.put<ApiResponse<FoodItem>>(`${this.base}/fooditems/${id}`, dto);
  }
  deleteFoodItem(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.base}/fooditems/${id}`);
  }
  toggleFoodItemAvailability(id: number): Observable<ApiResponse<FoodItem>> {
    return this.http.patch<ApiResponse<FoodItem>>(`${this.base}/fooditems/${id}/toggle-availability`, {});
  }

  // ── CUSTOMERS ─────────────────────────────────────────────
  getCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.base}/customers`);
  }
  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.base}/customers/${id}`);
  }
  registerCustomer(dto: RegisterCustomerDto): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.base}/customers/register`, dto);
  }
  loginCustomer(dto: LoginDto): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.base}/customers/login`, dto);
  }
  updateCustomer(id: number, dto: any): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.base}/customers/${id}`, dto);
  }
  getCustomerOrders(id: number): Observable<ApiResponse<RecentOrder[]>> {
    return this.http.get<ApiResponse<RecentOrder[]>>(`${this.base}/customers/${id}/orders`);
  }

  // ── ORDERS ────────────────────────────────────────────────
  getOrders(filters?: { status?: string; customerId?: number }): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams();
    if (filters?.status)     params = params.set('status',     filters.status);
    if (filters?.customerId) params = params.set('customerId', filters.customerId);
    return this.http.get<ApiResponse<Order[]>>(`${this.base}/orders`, { params });
  }
  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.base}/orders/${id}`);
  }
  getOrderByNumber(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.base}/orders/number/${orderNumber}`);
  }
  createOrder(dto: CreateOrderDto): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.base}/orders`, dto);
  }
  updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.base}/orders/${id}/status`, dto);
  }
  getOrderTracking(id: number): Observable<ApiResponse<OrderStatusHistoryDto[]>> {
    return this.http.get<ApiResponse<OrderStatusHistoryDto[]>>(`${this.base}/orders/${id}/tracking`);
  }

  // ── REVIEWS ───────────────────────────────────────────────
  getReviewsByFoodItem(foodItemId: number): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.base}/reviews/fooditem/${foodItemId}`);
  }
  createReview(dto: CreateReviewDto): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.base}/reviews`, dto);
  }

  // ── ADMIN ─────────────────────────────────────────────────
  adminLogin(dto: LoginDto): Observable<ApiResponse<Admin>> {
    return this.http.post<ApiResponse<Admin>>(`${this.base}/admin/login`, dto);
  }
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.base}/admin/dashboard`);
  }
  getAdminOrders(status?: string): Observable<ApiResponse<RecentOrder[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<RecentOrder[]>>(`${this.base}/admin/orders`, { params });
  }
}
