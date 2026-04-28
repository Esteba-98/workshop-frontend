import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  if (authService.hasAnyRole(allowedRoles)) return true;

  return router.createUrlTree(['/home']);
};
