// ── API RESPONSE WRAPPER ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── CATEGORY ──────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
}

// ── FOOD ITEM ─────────────────────────────────────────────
export interface FoodItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  preparationTimeMins: number;
  createdAt: string;
}

export interface CreateFoodItemDto {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  preparationTimeMins: number;
}

export interface UpdateFoodItemDto extends CreateFoodItemDto {
  isAvailable: boolean;
}

// ── CUSTOMER ──────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterCustomerDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ── ORDER ─────────────────────────────────────────────────
export type OrderStatus =
  | 'Pending' | 'Confirmed' | 'Preparing'
  | 'OutForDelivery' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'CashOnDelivery' | 'UPI' | 'Card' | 'NetBanking';

export interface OrderItemRequest {
  foodItemId: number;
  quantity: number;
  specialRequest?: string;
}

export interface CreateOrderDto {
  customerId: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryPhone: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
}

export interface OrderItemDto {
  id: number;
  foodItemId: number;
  foodItemName: string;
  quantity: number;
  unitPrice: number;
  discountPrice?: number;
  totalPrice: number;
  specialRequest?: string;
}

export interface OrderStatusHistoryDto {
  id: number;
  status: OrderStatus;
  changedBy: string;
  remarks?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryPhone: string;
  specialInstructions?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  changedBy: string;
  remarks?: string;
  cancellationReason?: string;
}

// ── CART ITEM ─────────────────────────────────────────────
export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialRequest?: string;
}

// ── REVIEW ────────────────────────────────────────────────
export interface Review {
  id: number;
  customerId: number;
  customerName: string;
  foodItemId: number;
  foodItemName: string;
  orderId: number;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewDto {
  customerId: number;
  foodItemId: number;
  orderId: number;
  rating: number;
  comment?: string;
}

// ── ADMIN ─────────────────────────────────────────────────
export interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalFoodItems: number;
  recentOrders: RecentOrder[];
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
