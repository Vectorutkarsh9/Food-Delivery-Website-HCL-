import { Injectable, signal } from '@angular/core';
import { Customer, Admin } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _customer = signal<Customer | null>(
    JSON.parse(localStorage.getItem('customer') ?? 'null')
  );
  private _admin = signal<Admin | null>(
    JSON.parse(localStorage.getItem('admin') ?? 'null')
  );

  customer     = this._customer.asReadonly();
  admin        = this._admin.asReadonly();
  isLoggedIn   = () => !!this._customer();
  isAdminIn    = () => !!this._admin();

  setCustomer(c: Customer): void {
    this._customer.set(c);
    localStorage.setItem('customer', JSON.stringify(c));
  }

  setAdmin(a: Admin): void {
    this._admin.set(a);
    localStorage.setItem('admin', JSON.stringify(a));
  }

  logoutCustomer(): void {
    this._customer.set(null);
    localStorage.removeItem('customer');
  }

  logoutAdmin(): void {
    this._admin.set(null);
    localStorage.removeItem('admin');
  }
}
