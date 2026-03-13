import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  // Redirect to unauthorized page or dashboard if user doesn't have required role
  router.navigate(['/overview']); // Defaulting to overview for now
  return false;
};
