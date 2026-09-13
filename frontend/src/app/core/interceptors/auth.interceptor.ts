import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for login and register requests
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const headers: Record<string, string> = {};
  if (token && !isAuthRequest) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const request = req.clone({
    withCredentials: true,
    setHeaders: headers,
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        // Token is invalid/expired or account was logged into on another device
        authService.logout();
        router.navigate(['/auth/login'], { queryParams: { sessionExpired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};
