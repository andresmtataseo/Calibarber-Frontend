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
      // Verificar tanto el estado reactivo como el localStorage directamente
      const hasToken = authState.token || authService.getToken();
      const isAuthenticated = authState.isAuthenticated || !!hasToken;

      if (isAuthenticated && hasToken) {
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
      // Verificar tanto el estado reactivo como el localStorage directamente
      const hasToken = authState.token || authService.getToken();
      const isAuthenticated = authState.isAuthenticated || !!hasToken;

      if (isAuthenticated && hasToken) {
        // Redirigir a home si ya está autenticado
        router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    })
  );
};

/**
 * Guard de administrador que protege rutas que requieren permisos de admin
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(authState => {
      // Verificar si el usuario está autenticado y es administrador
      if (authState.user && authState.user.role === 'ROLE_ADMIN') {
        return true;
      } else {
        // Redirigir a home si no es administrador
        router.navigate(['/']);
        return false;
      }
    })
  );
};
