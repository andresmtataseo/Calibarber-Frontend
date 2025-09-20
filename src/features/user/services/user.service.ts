import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, timeout, retry, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { USER_URLS } from '../../../core/config/api-urls.config';
import { ApiResponseDto } from '../../../shared/models/auth.models';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

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
   * Crea un nuevo usuario en el sistema
   *
   * @param createData - Datos del usuario a crear
   * @returns Observable con los datos del usuario creado
   * @throws Error con mensaje descriptivo en caso de fallo
   *
   * @example
   * ```typescript
   * const newUser = {
   *   email: 'usuario@email.com',
   *   password: 'password123',
   *   firstName: 'Juan',
   *   lastName: 'Pérez',
   *   role: UserRole.ROLE_CLIENT
   * };
   *
   * this.userService.createUser(newUser)
   *   .subscribe({
   *     next: (user) => console.log('Usuario creado:', user),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  createUser(createData: CreateUserRequest): Observable<UserResponse> {
    if (!createData) {
      return throwError(() => new Error('Los datos del usuario son requeridos'));
    }

    if (!createData.email || !createData.password || !createData.firstName || !createData.lastName) {
      return throwError(() => new Error('Email, contraseña, nombre y apellido son campos obligatorios'));
    }

    return this.http.post<ApiResponseDto<UserResponse>>(USER_URLS.BASE, createData)
      .pipe(
        timeout(this.DEFAULT_TIMEOUT),
        retry({
          count: this.MAX_RETRIES,
          delay: this.RETRY_DELAY
        }),
        map(response => {
          if (!response.data) {
            throw new Error('No se recibieron datos del usuario creado');
          }
          return response.data;
        }),
        catchError(error => this.handleError(error, 'crear usuario'))
      );
  }

  /**
   * Obtiene todos los usuarios con paginación
   *
   * @param page - Número de página (0-indexed)
   * @param size - Tamaño de página
   * @param sortBy - Campo por el cual ordenar
   * @param sortDir - Dirección del ordenamiento (asc/desc)
   * @returns Observable con la página de usuarios
   *
   * @example
   * ```typescript
   * this.userService.getAllUsers(0, 10, 'firstName', 'asc')
   *   .subscribe({
   *     next: (response) => console.log('Usuarios obtenidos:', response),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  getAllUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'firstName',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponseDto<any>>(
      USER_URLS.BASE,
      { params }
    ).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      retry(this.MAX_RETRIES),
      catchError((error) => this.handleError(error, 'obtener todos los usuarios'))
    );
  }



  /**
   * Actualiza los datos de un usuario específico
   *
   * @param userId - ID único del usuario a actualizar
   * @param updateData - Datos a actualizar del usuario
   * @returns Observable con los datos actualizados del usuario
   * @throws Error con mensaje descriptivo en caso de fallo
   *
   * @example
   * ```typescript
   * const updateData = {
   *   email: 'nuevo@email.com',
   *   firstName: 'Nuevo Nombre',
   *   lastName: 'Nuevo Apellido'
   * };
   *
   * this.userService.updateUser('user-id', updateData)
   *   .subscribe({
   *     next: (user) => console.log('Usuario actualizado:', user),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  updateUser(userId: string, updateData: UpdateUserRequest): Observable<UserResponse> {
    if (!userId || userId.trim() === '') {
      return throwError(() => new Error('El ID del usuario es requerido'));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return throwError(() => new Error('Los datos de actualización son requeridos'));
    }

    // Crear parámetros de consulta con el ID del usuario
    const params = new HttpParams().set('id', userId.trim());

    // URL base para actualización de usuarios
    const url = USER_URLS.BASE;

    return this.http.put<ApiResponseDto<UserResponse>>(url, updateData, { params })
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
            throw new Error('No se recibieron datos del usuario actualizado');
          }
          return response.data;
        }),

        // Manejo centralizado de errores
        catchError(error => this.handleError(error, 'actualizar usuario'))
      );
  }

  /**
   * Elimina un usuario del sistema (soft delete)
   *
   * @param userId - ID único del usuario a eliminar
   * @returns Observable que se completa cuando la eliminación es exitosa
   * @throws Error con mensaje descriptivo en caso de fallo
   *
   * @example
   * ```typescript
   * this.userService.deleteUser('user-id')
   *   .subscribe({
   *     next: () => console.log('Usuario eliminado exitosamente'),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  deleteUser(userId: string): Observable<void> {
    if (!userId || userId.trim() === '') {
      return throwError(() => new Error('El ID del usuario es requerido'));
    }

    const params = new HttpParams().set('id', userId.trim());

    return this.http.delete<ApiResponseDto<void>>(USER_URLS.BASE, { params })
      .pipe(
        timeout(this.DEFAULT_TIMEOUT),
        retry({
          count: this.MAX_RETRIES,
          delay: this.RETRY_DELAY
        }),
        map(() => void 0), // Convertir a void
        catchError(error => this.handleError(error, 'eliminar usuario'))
      );
  }

  /**
   * Restaura un usuario que fue eliminado previamente
   *
   * @param userId - ID único del usuario a restaurar
   * @returns Observable con los datos del usuario restaurado
   * @throws Error con mensaje descriptivo en caso de fallo
   *
   * @example
   * ```typescript
   * this.userService.restoreUser('user-id')
   *   .subscribe({
   *     next: (user) => console.log('Usuario restaurado:', user),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  restoreUser(userId: string): Observable<UserResponse> {
    if (!userId || userId.trim() === '') {
      return throwError(() => new Error('El ID del usuario es requerido'));
    }

    const params = new HttpParams().set('id', userId.trim());
    const url = `${USER_URLS.BASE}/restore`;

    return this.http.post<ApiResponseDto<UserResponse>>(url, {}, { params })
      .pipe(
        timeout(this.DEFAULT_TIMEOUT),
        retry({
          count: this.MAX_RETRIES,
          delay: this.RETRY_DELAY
        }),
        map(response => {
          if (!response.data) {
            throw new Error('No se recibieron datos del usuario restaurado');
          }
          return response.data;
        }),
        catchError(error => this.handleError(error, 'restaurar usuario'))
      );
  }

  /**
   * Obtiene todos los usuarios eliminados con paginación
   *
   * @param page - Número de página (0-indexed)
   * @param size - Tamaño de página
   * @param sortBy - Campo por el cual ordenar
   * @param sortDir - Dirección del ordenamiento (asc/desc)
   * @returns Observable con la página de usuarios eliminados
   *
   * @example
   * ```typescript
   * this.userService.getDeletedUsers(0, 10, 'firstName', 'asc')
   *   .subscribe({
   *     next: (response) => console.log('Usuarios eliminados:', response),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  getDeletedUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'firstName',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    const url = `${USER_URLS.BASE}/deleted`;

    return this.http.get<ApiResponseDto<any>>(url, { params })
      .pipe(
        timeout(this.DEFAULT_TIMEOUT),
        retry(this.MAX_RETRIES),
        catchError((error) => this.handleError(error, 'obtener usuarios eliminados'))
      );
  }

  /**
   * Obtiene el total de usuarios activos en el sistema
   *
   * @returns Observable con el número total de usuarios activos
   * @throws Error con mensaje descriptivo en caso de fallo
   *
   * @example
   * ```typescript
   * this.userService.getTotalActiveUsers()
   *   .subscribe({
   *     next: (count) => console.log('Total usuarios activos:', count),
   *     error: (error) => console.error('Error:', error.message)
   *   });
   * ```
   */
  getTotalActiveUsers(): Observable<number> {
    const url = USER_URLS.COUNT_ACTIVE;

    return this.http.get<ApiResponseDto<number>>(url)
      .pipe(
        timeout(this.DEFAULT_TIMEOUT),
        retry(this.MAX_RETRIES),
        map(response => {
          if (response.data !== undefined) {
            return response.data;
          }
          throw new Error('Error al obtener el total de usuarios activos');
        }),
        catchError(error => this.handleError(error, 'obtener el total de usuarios activos'))
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
