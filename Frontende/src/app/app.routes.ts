import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/admin/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/order-management/order-management.component').then(m => m.OrderManagementComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/admin/customer-management/customer-management.component').then(m => m.CustomerManagementComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
