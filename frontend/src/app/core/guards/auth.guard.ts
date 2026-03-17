import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// TODO: Implement full auth guard logic
// - Check if user is authenticated
// - Redirect to /login if not

export const authGuard: CanActivateFn = () => {
  // TODO: REMOVE THIS BYPASS — FOR TESTING ONLY
  return true;

  // const authService = inject(AuthService);
  // const router = inject(Router);
  // if (authService.isAuthenticated()) { return true; }
  // router.navigate(['/auth/login']);
  // return false;
};
