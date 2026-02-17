import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// TODO: Implement role-based access control
// - Check user's role against allowed roles for the route
// - Redirect to unauthorized page or dashboard if role doesn't match

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  // TODO: Get user role from AuthService (decode JWT)
  // const allowedRoles = route.data?.['roles'] as string[];

  // Placeholder: allow all for now
  return true;
};
