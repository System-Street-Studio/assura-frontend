import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

import { LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../../features/auth/models/auth.models';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  /**
   * Register a new user (POST Request)
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Request a password reset link
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }

  /**
   * Reset the password using a token
   */
  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
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

  // Returns the user's first name from the JWT token.
  getFirstName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: unknown = jwtDecode(token);
      const payload = decoded as {
        given_name?: string;
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'?: string;
        unique_name?: string;
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
      };
      const name =
        payload.given_name ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ??
        payload.unique_name ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        null;
      // If the name contains spaces, return only the first word
      return name ? name.split(' ')[0] : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
