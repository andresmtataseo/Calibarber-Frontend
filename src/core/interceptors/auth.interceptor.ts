import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que agrega automáticamente el token de autenticación
 * a las peticiones HTTP que lo requieran
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Si no hay token o es una petición de autenticación, continuar sin modificar
  if (!token || isAuthRequest(req.url)) {
    return next(req);
  }

  // Clonar la petición y agregar el header de autorización
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token es inválido (401), cerrar sesión automáticamente
      if (error.status === 401) {
        console.warn('Token inválido o expirado, cerrando sesión automáticamente');
        authService.signOut();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Verifica si la petición es para endpoints de autenticación
 * que no requieren token
 */
function isAuthRequest(url: string): boolean {
  const authEndpoints = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/check-email'
    // check-auth SÍ requiere token de autorización
  ];

  // También excluir recursos estáticos y APIs públicas
  const publicEndpoints = [
    '/assets/',
    '/public/',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico'
  ];

  return authEndpoints.some(endpoint => url.includes(endpoint)) ||
         publicEndpoints.some(endpoint => url.includes(endpoint));
}
