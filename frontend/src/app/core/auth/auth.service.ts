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
      const decoded: any = jwtDecode(token);
      // Check for expiration
      const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch {
      return null;
    }
  }

  hasRole(requiredRole: string | string[]): boolean {
    const userRole = this.getRole();
    if (!userRole) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
