import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que agrega automáticamente el token de autenticación
 * a las peticiones HTTP que lo requieran
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si no hay token o es una petición de autenticación, continuar sin modificar
  if (!token || isAuthRequest(req.url)) {
    return next(req);
  }

  // Clonar la petición y agregar el header de autorización
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq);
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
  ];

  return authEndpoints.some(endpoint => url.includes(endpoint));
}
