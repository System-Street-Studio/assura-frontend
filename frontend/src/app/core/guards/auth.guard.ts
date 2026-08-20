import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

const PENDING_ASSIGNMENT_PATH = '/pending-assignment';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // A user with no role/division yet may only reach the waiting screen (and log out from
  // it) — every other internal route redirects them there until HR/Admin assigns them.
  if (authService.isPendingUser() && !state.url.startsWith(PENDING_ASSIGNMENT_PATH)) {
    router.navigate([PENDING_ASSIGNMENT_PATH]);
    return false;
  }

  return true;
};
