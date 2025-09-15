import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UrlService } from '../../../core/services/url.service';
import {
  BarberResponse,
  CreateBarberRequest,
  UpdateBarberRequest,
  BarberAvailabilityResponse,
  CreateBarberAvailabilityRequest,
  BarberPageResponse
} from '../models/barber.model';
import { ApiResponseDto } from '../../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class BarberService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);

  // ========== MÉTODOS CRUD BÁSICOS PARA BARBEROS ==========

  /**
   * Crea un nuevo barbero
   * @param barberData Datos del barbero a crear
   * @returns Observable con el barbero creado
   */
  createBarber(barberData: CreateBarberRequest): Observable<BarberResponse> {
    return this.http.post<ApiResponseDto<BarberResponse>>(
      this.urlService.getBarberUrl('BASE'),
      barberData
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Error al crear el barbero');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene barberos con diferentes opciones de filtrado y paginación
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @param id ID del barbero específico (opcional)
   * @param barbershopId ID de la barbería para filtrar (opcional)
   * @param specialization Especialización para filtrar (opcional)
   * @returns Observable con barbero específico o página de barberos
   */
  getBarbers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    id?: string,
    barbershopId?: string,
    specialization?: string
  ): Observable<ApiResponseDto<BarberResponse | BarberPageResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (id) {
      params = params.set('id', id);
    }

    if (barbershopId) {
      params = params.set('barbershopId', barbershopId);
    }

    if (specialization) {
      params = params.set('specialization', specialization);
    }

    return this.http.get<ApiResponseDto<BarberResponse | BarberPageResponse>>(
      this.urlService.getBarberUrl('BASE'),
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene un barbero por su ID
   * @param id ID del barbero
   * @returns Observable con el barbero
   */
  getBarberById(id: string): Observable<BarberResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.get<ApiResponseDto<BarberResponse>>(
      this.urlService.getBarberUrl('BASE'),
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontró el barbero');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene todos los barberos con paginación
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la página de barberos
   */
  getAllBarbers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<BarberPageResponse>> {
    return this.getBarbers(page, size, sortBy, sortDir) as Observable<ApiResponseDto<BarberPageResponse>>;
  }

  /**
   * Obtiene barberos por barbería
   * @param barbershopId ID de la barbería
   * @param page Número de página
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento
   * @returns Observable con la página de barberos
   */
  getBarbersByBarbershop(
    barbershopId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<BarberPageResponse>> {
    return this.getBarbers(page, size, sortBy, sortDir, undefined, barbershopId) as Observable<ApiResponseDto<BarberPageResponse>>;
  }

  /**
   * Obtiene barberos por especialización
   * @param specialization Especialización
   * @param page Número de página
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento
   * @returns Observable con la página de barberos
   */
  getBarbersBySpecialization(
    specialization: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<BarberPageResponse>> {
    return this.getBarbers(page, size, sortBy, sortDir, undefined, undefined, specialization) as Observable<ApiResponseDto<BarberPageResponse>>;
  }

  /**
   * Actualiza un barbero existente
   * @param id ID del barbero
   * @param barberData Datos del barbero a actualizar
   * @returns Observable con el barbero actualizado
   */
  updateBarber(id: string, barberData: UpdateBarberRequest): Observable<BarberResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.put<ApiResponseDto<BarberResponse>>(
      this.urlService.getBarberUrl('BASE'),
      barberData,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Error al actualizar el barbero');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina un barbero (soft delete)
   * @param id ID del barbero
   * @returns Observable con la confirmación
   */
  deleteBarber(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);

    return this.http.delete<ApiResponseDto<void>>(
      this.urlService.getBarberUrl('BASE'),
      { params }
    ).pipe(
      map(() => void 0),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Restaura un barbero eliminado
   * @param id ID del barbero
   * @returns Observable con el barbero restaurado
   */
  restoreBarber(id: string): Observable<BarberResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.post<ApiResponseDto<BarberResponse>>(
      `${this.urlService.getBarberUrl('BASE')}/restore`,
      {},
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Error al restaurar el barbero');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene barberos eliminados
   * @param page Número de página
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento
   * @returns Observable con la página de barberos eliminados
   */
  getDeletedBarbers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<BarberPageResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<ApiResponseDto<BarberPageResponse>>(
      `${this.urlService.getBarberUrl('BASE')}/deleted`,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // ========== MÉTODOS PARA GESTIÓN DE DISPONIBILIDAD ==========

  /**
   * Crea una nueva disponibilidad para un barbero
   * @param availabilityData Datos de disponibilidad
   * @returns Observable con la disponibilidad creada
   */
  createAvailability(availabilityData: CreateBarberAvailabilityRequest): Observable<BarberAvailabilityResponse> {
    return this.http.post<ApiResponseDto<BarberAvailabilityResponse>>(
      `${this.urlService.getBarberUrl('BASE')}/availability`,
      availabilityData
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Error al crear la disponibilidad');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene la disponibilidad de un barbero
   * @param barberId ID del barbero
   * @param dayOfWeek Día de la semana (opcional)
   * @param page Número de página
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento
   * @returns Observable con la disponibilidad
   */
  getBarberAvailability(
    barberId?: string,
    dayOfWeek?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'dayOfWeek',
    sortDir: string = 'asc'
  ): Observable<ApiResponseDto<BarberAvailabilityResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (barberId) {
      params = params.set('barberId', barberId);
    }

    if (dayOfWeek) {
      params = params.set('dayOfWeek', dayOfWeek);
    }

    return this.http.get<ApiResponseDto<BarberAvailabilityResponse[]>>(
      `${this.urlService.getBarberUrl('BASE')}/availability`,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza la disponibilidad de un barbero
   * @param availabilityId ID de la disponibilidad
   * @param availabilityData Datos de disponibilidad
   * @returns Observable con la disponibilidad actualizada
   */
  updateAvailability(
    availabilityId: string,
    availabilityData: CreateBarberAvailabilityRequest
  ): Observable<BarberAvailabilityResponse> {
    const params = new HttpParams().set('availabilityId', availabilityId);

    return this.http.put<ApiResponseDto<BarberAvailabilityResponse>>(
      `${this.urlService.getBarberUrl('BASE')}/availability`,
      availabilityData,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('Error al actualizar la disponibilidad');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina la disponibilidad de un barbero
   * @param availabilityId ID de la disponibilidad
   * @returns Observable con la confirmación
   */
  deleteAvailability(availabilityId: string): Observable<void> {
    const params = new HttpParams().set('availabilityId', availabilityId);

    return this.http.delete<ApiResponseDto<void>>(
      `${this.urlService.getBarberUrl('BASE')}/availability`,
      { params }
    ).pipe(
      map(() => void 0),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene horarios disponibles de un barbero para una fecha específica
   * @param barberId ID del barbero
   * @param date Fecha en formato YYYY-MM-DD
   * @returns Observable con los horarios disponibles
   */
  getAvailableSlots(
    barberId: string,
    date: string
  ): Observable<ApiResponseDto<string[]>> {
    const params = new HttpParams()
      .set('barberId', barberId)
      .set('date', date);

    return this.http.get<ApiResponseDto<string[]>>(
      `${this.urlService.getBarberUrl('BASE')}/availability/slots`,
      { params }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Maneja errores HTTP
   * @param error Error HTTP
   * @returns Observable con error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'No autorizado';
            break;
          case 403:
            errorMessage = 'Acceso denegado';
            break;
          case 404:
            errorMessage = 'Barbero no encontrado';
            break;
          case 409:
            errorMessage = 'El barbero ya existe';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error('BarberService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}