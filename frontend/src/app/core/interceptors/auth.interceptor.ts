import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

// TODO: Implement full interceptor logic
// - Attach JWT token to outgoing requests
// - Handle 401 responses (token expired → redirect to login)

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip adding token for login and register requests
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !isAuthRequest) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
