import { Injectable } from '@angular/core';

// TODO: Implement JWT authentication logic
// - Login (store token)
// - Logout (clear token)
// - Token refresh
// - isAuthenticated check

import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: unknown = jwtDecode(token);
      // Check for expiration
      const payload = decoded as { exp: number };
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  // Returns all roles from the JWT as a string array.
  // Handles both single role (string) and multiple roles (string[]) from .NET.
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded: unknown = jwtDecode(token);
      const payload = decoded as {
        role?: string | string[];
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
      };
      const raw =
        payload.role ??
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        [];
      return Array.isArray(raw) ? raw : [raw];
    } catch {
      return [];
    }
  }

  // Returns the first role for display purposes.
  getRole(): string | null {
    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] : null;
  }

  hasRole(requiredRole: string | string[]): boolean {
    const userRoles = this.getRoles();
    if (userRoles.length === 0) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.some(r => userRoles.includes(r));
    }
    return userRoles.includes(requiredRole);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
