import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UrlService } from '../../../core/services/url.service';
import {
  BarbershopOperatingHours,
  BarbershopOperatingHoursCreate
} from '../models/barbershop.model';
import { ApiResponseDto } from '../../../shared/models/auth.models';

/**
 * Servicio para gestionar los horarios de atención de las barberías
 * Consume la API del BarbershopOperatingHoursController del backend
 */
@Injectable({
  providedIn: 'root'
})
export class BarbershopOperatingHoursService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);

  /**
   * Crea los horarios de atención para una barbería
   * @param barbershopId ID de la barbería
   * @param operatingHours Array de horarios de atención
   * @returns Observable con los horarios creados
   */
  createOperatingHours(
    barbershopId: string,
    operatingHours: BarbershopOperatingHoursCreate[]
  ): Observable<BarbershopOperatingHours[]> {
    const params = new HttpParams().set('barbershopId', barbershopId);
    
    return this.http.post<ApiResponseDto<BarbershopOperatingHours[]>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      operatingHours,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos de los horarios creados');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los horarios de atención de una barbería
   * @param barbershopId ID de la barbería
   * @returns Observable con los horarios de atención
   */
  getOperatingHoursByBarbershopId(barbershopId: string): Observable<BarbershopOperatingHours[]> {
    const params = new HttpParams().set('barbershopId', barbershopId);
    
    return this.http.get<ApiResponseDto<BarbershopOperatingHours[]>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontraron horarios para esta barbería');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene un horario específico por su ID
   * @param id ID del horario
   * @returns Observable con el horario
   */
  getOperatingHourById(id: string): Observable<BarbershopOperatingHours> {
    const params = new HttpParams().set('id', id);
    
    return this.http.get<ApiResponseDto<BarbershopOperatingHours>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/by-id`,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontró el horario especificado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza un horario de atención específico
   * @param id ID del horario a actualizar
   * @param operatingHour Datos actualizados del horario
   * @returns Observable con el horario actualizado
   */
  updateOperatingHour(
    id: string,
    operatingHour: BarbershopOperatingHoursCreate
  ): Observable<BarbershopOperatingHours> {
    const params = new HttpParams().set('id', id);
    
    return this.http.put<ApiResponseDto<BarbershopOperatingHours>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      operatingHour,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudo actualizar el horario');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza múltiples horarios de atención para una barbería
   * @param barbershopId ID de la barbería
   * @param operatingHours Array de horarios actualizados
   * @returns Observable con los horarios actualizados
   */
  updateMultipleOperatingHours(
    barbershopId: string,
    operatingHours: BarbershopOperatingHoursCreate[]
  ): Observable<BarbershopOperatingHours[]> {
    const params = new HttpParams().set('barbershopId', barbershopId);
    
    return this.http.put<ApiResponseDto<BarbershopOperatingHours[]>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/multiple`,
      operatingHours,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se pudieron actualizar los horarios');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina un horario de atención específico
   * @param id ID del horario a eliminar
   * @returns Observable con la confirmación
   */
  deleteOperatingHour(id: string): Observable<string> {
    const params = new HttpParams().set('id', id);
    
    return this.http.delete<ApiResponseDto<string>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      { params }
    ).pipe(
      map(response => {
        return response.message || 'Horario eliminado exitosamente';
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina todos los horarios de atención de una barbería
   * @param barbershopId ID de la barbería
   * @returns Observable con la confirmación
   */
  deleteAllOperatingHours(barbershopId: string): Observable<string> {
    const params = new HttpParams().set('barbershopId', barbershopId);
    
    return this.http.delete<ApiResponseDto<string>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/all`,
      { params }
    ).pipe(
      map(response => {
        return response.message || 'Todos los horarios eliminados exitosamente';
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Valida si los horarios de atención son válidos
   * @param operatingHours Array de horarios a validar
   * @returns Observable con el resultado de la validación
   */
  validateOperatingHours(operatingHours: BarbershopOperatingHoursCreate[]): Observable<boolean> {
    return this.http.post<ApiResponseDto<boolean>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/validate`,
      operatingHours
    ).pipe(
      map(response => {
        return response.data || false;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los días de la semana disponibles para configurar horarios
   * @returns Observable con los días disponibles
   */
  getAvailableDays(): Observable<string[]> {
    return this.http.get<ApiResponseDto<string[]>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/available-days`
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        return ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
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
          errorMessage = error.error?.message || 'Datos de horarios inválidos';
          break;
        case 401:
          errorMessage = 'No tienes autorización para gestionar horarios';
          break;
        case 403:
          errorMessage = 'No tienes permisos para gestionar horarios';
          break;
        case 404:
          errorMessage = error.error?.message || 'Horarios no encontrados';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto en los horarios especificados';
          break;
        case 422:
          errorMessage = error.error?.message || 'Los horarios proporcionados no son válidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor al procesar horarios';
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

    console.error('Barbershop Operating Hours Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}