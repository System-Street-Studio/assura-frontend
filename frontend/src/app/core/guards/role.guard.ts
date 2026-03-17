import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  // TODO: REMOVE THIS BYPASS — FOR TESTING ONLY
  return true;

  // const authService = inject(AuthService);
  // const router = inject(Router);
  // const allowedRoles = route.data?.['roles'] as string[];
  // if (!allowedRoles || allowedRoles.length === 0) { return true; }
  // if (authService.hasRole(allowedRoles)) { return true; }
  // router.navigate(['/overview']);
  // return false;
};
