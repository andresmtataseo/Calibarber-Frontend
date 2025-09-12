import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard de autenticación que protege rutas que requieren usuario autenticado
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(authState => {
      if (authState.isAuthenticated && authState.token) {
        return true;
      } else {
        // Redirigir al login si no está autenticado
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

/**
 * Guard que previene el acceso a rutas de autenticación cuando ya está logueado
 */
export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(authState => {
      if (authState.isAuthenticated && authState.token) {
        // Redirigir a home si ya está autenticado
        router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    })
  );
};
