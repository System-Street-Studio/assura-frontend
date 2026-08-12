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
      const payload = decoded as { exp?: number };
      // If token has no exp claim, treat as expired (not authenticated)
      if (!payload.exp) return false;
      // Check if token is expired
      return payload.exp * 1000 > Date.now();
    } catch {
      // Malformed token — clear it and return false
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
  }

  // Returns all roles from the JWT as a string array.
  // Handles both single role (string) and multiple roles (string[]) from .NET.
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);
      const raw =
        decoded.role ??
        decoded.roles ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ??
        [];
      const roles = Array.isArray(raw) ? raw : [raw];
      // Filter out any undefined or empty string roles
      const validRoles = roles.filter(r => r && r.trim() !== '');
      return validRoles.length > 0 ? validRoles : ['Pending'];
    } catch {
      return ['Pending'];
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

  // Returns the user's ID from the JWT token.
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded.sub ??
        decoded.nameid ??
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'] ??
        null
      );
    } catch {
      return null;
    }
  }

  // Returns the user's name from the JWT token.
  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded.unique_name ??
        decoded.name ??
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        null
      );
    } catch {
      return null;
    }
  }

  // Returns the user's division ID from the JWT token.
  getDivisionId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      const divisionId = decoded.divisionId ??
        decoded.DivisionId ??
        decoded.division_id ??
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/divisionId'] ??
        null;
      return divisionId ? Number(divisionId) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getDashboardUrl(): string {
    const roles = this.getRoles();
    if (roles.includes('SystemAdmin')) return '/system-admin/overview';
    if (roles.includes('Admin')) return '/admin/overview';
    if (roles.includes('Procurement')) return '/procurement/overview';
    if (roles.includes('Storekeeper')) return '/inventory/dashboard';
    if (roles.includes('Auditor')) return '/reporting/dashboard';
    if (roles.includes('HR')) return '/hr/overview';
    if (roles.includes('Accountant')) return '/accountant/discarded';
    if (roles.includes('Superintendent')) return '/superintendent/overview';
    if (roles.includes('DivisionHead')) return '/approvals/overview';
    if (roles.includes('Employee')) return '/employee/employee-overview';
    return '/overview';
  }

  isPendingUser(): boolean {
    const hasPendingRole = this.hasRole('Pending');
    const isSysAdmin = this.hasRole('SystemAdmin');
    
    // Explicitly check if it's null or undefined
    const divisionId = this.getDivisionId();
    const noDivision = divisionId === null || divisionId === undefined || isNaN(divisionId) || divisionId === 0;
    
    return hasPendingRole || (noDivision && !isSysAdmin);
  }
}
