import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthUser, AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

// Redirects a logged-in user of the wrong role to their own home instead of just refusing.
export function roleGuard(role: AuthUser['role']): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getUser();
    if (!user) return router.createUrlTree(['/login']);
    if (user.role === role) return true;
    return router.createUrlTree([user.role === 'recruiter' ? '/recruiter/postings' : '/jobs']);
  };
}
