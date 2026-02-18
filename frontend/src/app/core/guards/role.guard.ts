import { CanActivateFn } from '@angular/router';

// TODO: Implement role-based access control
// - Check user's role against allowed roles for the route
// - Redirect to unauthorized page or dashboard if role doesn't match

export const roleGuard: CanActivateFn = () => {
  // const router = inject(Router);

  // TODO: Get user role from AuthService (decode JWT)
  // const allowedRoles = route.data?.['roles'] as string[];

  // Placeholder: allow all for now
  return true;
};
