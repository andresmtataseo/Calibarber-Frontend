import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, timeout, retry, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { USER_URLS } from '../../../core/config/api-urls.config';
import { ApiResponseDto } from '../../../shared/models/auth.models';
import { UserResponse } from '../models/user.model';

/**
 * Servicio para gestionar operaciones relacionadas con usuarios
 * 
 * Proporciona métodos para obtener información de usuarios desde el backend
 * con manejo robusto de errores, timeouts y reintentos automáticos.
 * 
 * @author CaliBarber Team
 * @version 1.0.0
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  
  // Configuración de timeouts y reintentos
  private readonly DEFAULT_TIMEOUT = 10000; // 10 segundos
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  /**
   * Obtiene los datos de un usuario específico por su ID
   * 
   * @param userId - ID único del usuario a obtener
   * @returns Observable con los datos del usuario
   * @throws Error con mensaje descriptivo en caso de fallo
   * 
   * @example
   * ```typescript
   * this.userService.getUserById('e9c37e7e-66aa-4b07-a47a-69b27b2efed3')
   *   .subscribe({
   *     next: (user) => console.log('Usuario obtenido:', user),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  getUserById(userId: string): Observable<UserResponse> {
    if (!userId || userId.trim() === '') {
      return throwError(() => new Error('El ID del usuario es requerido'));
    }

    const url = USER_URLS.BY_ID(userId.trim());
    
    return this.http.get<ApiResponseDto<UserResponse>>(url)
      .pipe(
        // Aplicar timeout para evitar esperas indefinidas
        timeout(this.DEFAULT_TIMEOUT),
        
        // Reintentar automáticamente en caso de errores temporales
        retry({
          count: this.MAX_RETRIES,
          delay: this.RETRY_DELAY
        }),
        
        // Extraer los datos del wrapper de respuesta
        map(response => {
          if (!response.data) {
            throw new Error('No se recibieron datos del usuario');
          }
          return response.data;
        }),
        
        // Manejo centralizado de errores
        catchError(error => this.handleError(error, 'obtener usuario'))
      );
  }

  /**
   * Obtiene múltiples usuarios por sus IDs
   * 
   * @param userIds - Array de IDs de usuarios
   * @returns Observable con array de usuarios
   */
  getUsersByIds(userIds: string[]): Observable<UserResponse[]> {
    if (!userIds || userIds.length === 0) {
      return throwError(() => new Error('Se requiere al menos un ID de usuario'));
    }

    // Filtrar IDs válidos
    const validIds = userIds.filter(id => id && id.trim() !== '');
    if (validIds.length === 0) {
      return throwError(() => new Error('No se proporcionaron IDs válidos'));
    }

    // Crear requests paralelos para cada usuario
    const requests = validIds.map(id => this.getUserById(id));
    
    // Usar forkJoin para ejecutar todas las peticiones en paralelo
    return new Observable<UserResponse[]>(observer => {
      let completedRequests = 0;
      let hasError = false;
      const results: UserResponse[] = [];
      const errors: Error[] = [];

      requests.forEach((request, index) => {
        request.subscribe({
          next: (user) => {
            if (!hasError) {
              results[index] = user;
              completedRequests++;
              
              if (completedRequests === requests.length) {
                observer.next(results.filter(result => result !== undefined));
                observer.complete();
              }
            }
          },
          error: (error) => {
            errors.push(error);
            completedRequests++;
            
            if (completedRequests === requests.length) {
              if (results.filter(result => result !== undefined).length > 0) {
                // Si al menos un usuario se obtuvo correctamente, devolver los resultados parciales
                observer.next(results.filter(result => result !== undefined));
                observer.complete();
              } else {
                // Si todos fallaron, devolver el primer error
                hasError = true;
                observer.error(errors[0] || new Error('Error al obtener usuarios'));
              }
            }
          }
        });
      });
    });
  }

  /**
   * Verifica si un usuario existe
   * 
   * @param userId - ID del usuario a verificar
   * @returns Observable<boolean> - true si existe, false si no
   */
  userExists(userId: string): Observable<boolean> {
    return this.getUserById(userId)
      .pipe(
        map(() => true),
        catchError(() => {
          // Si hay error, asumimos que el usuario no existe
          return [false];
        })
      );
  }

  /**
   * Maneja errores HTTP de manera centralizada
   * 
   * @param error - Error HTTP recibido
   * @param operation - Descripción de la operación que falló
   * @returns Observable que emite un error con mensaje descriptivo
   */
  private handleError(error: any, operation: string = 'operación'): Observable<never> {
    let errorMessage = `Error al ${operation}`;
    
    console.error(`UserService - Error en ${operation}:`, error);

    if (error instanceof HttpErrorResponse) {
      // Errores HTTP específicos
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No tienes autorización para realizar esta acción. Inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a esta información.';
          break;
        case 404:
          errorMessage = 'El usuario solicitado no fue encontrado.';
          break;
        case 408:
          errorMessage = 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'El servidor no está disponible temporalmente. Intenta más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor (${error.status}). Intenta más tarde.`;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'La solicitud tardó demasiado tiempo. Verifica tu conexión e intenta nuevamente.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}