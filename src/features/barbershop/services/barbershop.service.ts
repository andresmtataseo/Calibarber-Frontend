import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UrlService } from '../../../core/services/url.service';
import {
  BarbershopResponse,
  CreateBarbershopRequest,
  UpdateBarbershopRequest
} from '../models/barbershop.model';
import { ApiResponseDto } from '../../../shared/models/auth.models';

/**
 * Servicio para gestionar las operaciones CRUD de barberías
 * Consume la API del BarbershopController del backend
 */
@Injectable({
  providedIn: 'root'
})
export class BarbershopService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);

  /**
   * Crea una nueva barbería
   * @param createDto Datos de la barbería a crear
   * @returns Observable con la barbería creada
   */
  createBarbershop(createDto: CreateBarbershopRequest): Observable<BarbershopResponse> {
    return this.http.post<ApiResponseDto<BarbershopResponse>>(
      this.urlService.getBarbershopUrl('BASE'),
      createDto
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos de la barbería creada');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene una barbería por su ID
   * @param id ID de la barbería
   * @returns Observable con la barbería
   */
  getBarbershopById(id: string): Observable<BarbershopResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.get<ApiResponseDto<BarbershopResponse>>(
      this.urlService.getBarbershopUrl('BASE'),
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontró la barbería');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene todas las barberías con paginación
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la página de barberías
   */
  getAllBarbershops(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponseDto<any>>(
      this.urlService.getBarbershopUrl('BASE'),
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza una barbería existente
   * @param id ID de la barbería a actualizar
   * @param updateDto Datos actualizados de la barbería
   * @returns Observable con la barbería actualizada
   */
  updateBarbershop(id: string, updateDto: UpdateBarbershopRequest): Observable<BarbershopResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.put<ApiResponseDto<BarbershopResponse>>(
      this.urlService.getBarbershopUrl('BASE'),
      updateDto,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudo actualizar la barbería');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina una barbería (soft delete)
   * @param id ID de la barbería a eliminar
   * @returns Observable con la confirmación
   */
  deleteBarbershop(id: string): Observable<string> {
    const params = new HttpParams().set('id', id);

    return this.http.delete<ApiResponseDto<string>>(
      this.urlService.getBarbershopUrl('BASE'),
      { params }
    ).pipe(
      map(response => {
        return response.message || 'Barbería eliminada exitosamente';
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Restaura una barbería eliminada
   * @param id ID de la barbería a restaurar
   * @returns Observable con la barbería restaurada
   */
  restoreBarbershop(id: string): Observable<BarbershopResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.post<ApiResponseDto<BarbershopResponse>>(
      `${this.urlService.getBarbershopUrl('BASE')}/restore`,
      {},
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudo restaurar la barbería');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene barberías eliminadas con paginación
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la página de barberías eliminadas
   */
  getDeletedBarbershops(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'name',
    sortDir: string = 'asc'
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponseDto<any>>(
      `${this.urlService.getBarbershopUrl('BASE')}/deleted`,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudieron obtener las barberías eliminadas');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Maneja errores de HTTP
   * @param error Error de HTTP
   * @returns Observable con el error procesado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No tienes autorización para realizar esta acción';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = error.error?.message || 'Barbería no encontrada';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto con los datos existentes';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        case 0:
          errorMessage = 'No se pudo conectar con el servidor';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    console.error('Barbershop Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}