import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UrlService } from '../../../core/services/url.service';
import {
  BarbershopOperatingHours,
  BarbershopOperatingHoursRequest,
  BarbershopOperatingHoursRequestDto,
  DayOfWeek
} from '../models/operating-hours.model';
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
   * Crea o actualiza un horario de atención individual para una barbería
   * @param requestDto DTO con los datos del horario
   * @returns Observable con el horario creado/actualizado
   */
  createOrUpdateOperatingHour(
    requestDto: BarbershopOperatingHoursRequest
  ): Observable<BarbershopOperatingHours> {
    const dto = new BarbershopOperatingHoursRequestDto(requestDto);
    
    // Validar antes de enviar
    if (!dto.isValidSchedule()) {
      const errorMessage = dto.getValidationErrorMessage();
      return throwError(() => new Error(errorMessage || 'Datos de horario inválidos'));
    }
    
    return this.http.post<ApiResponseDto<BarbershopOperatingHours>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      dto
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos del horario creado/actualizado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crea o actualiza múltiples horarios de atención para una barbería
   * @param barbershopId ID de la barbería
   * @param operatingHours Array de horarios de atención
   * @returns Observable con los horarios creados/actualizados
   */
  createOrUpdateOperatingHours(
    barbershopId: string,
    operatingHours: BarbershopOperatingHoursRequest[]
  ): Observable<BarbershopOperatingHours[]> {
    // Crear requests individuales para cada horario
    const requests = operatingHours.map(hour => 
      this.createOrUpdateOperatingHour({
        ...hour,
        barbershopId
      })
    );
    
    // Ejecutar todas las requests en paralelo
    return forkJoin(requests);
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
   * Obtiene el horario de operación para un día específico
   * @param barbershopId ID de la barbería
   * @param dayOfWeek Día de la semana (enum DayOfWeek)
   * @returns Observable con el horario del día
   */
  getOperatingHoursForDay(
    barbershopId: string,
    dayOfWeek: DayOfWeek
  ): Observable<BarbershopOperatingHours> {
    const params = new HttpParams()
      .set('barbershopId', barbershopId)
      .set('dayOfWeek', dayOfWeek.toString());
    
    return this.http.get<ApiResponseDto<BarbershopOperatingHours>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours/day`,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontró el horario para el día especificado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina todos los horarios de atención de una barbería
   * Nota: Este método puede requerir múltiples llamadas individuales
   * dependiendo de la implementación del backend
   * @param barbershopId ID de la barbería
   * @returns Observable con la confirmación
   */
  deleteOperatingHours(barbershopId: string): Observable<string> {
    const params = new HttpParams().set('barbershopId', barbershopId);
    
    return this.http.delete<ApiResponseDto<void>>(
      `${this.urlService.getBarbershopUrl('BASE')}/operating-hours`,
      { params }
    ).pipe(
      map(response => {
        return response.message || 'Horarios eliminados exitosamente';
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene los días de la semana disponibles para configurar horarios
   * @returns Array con los días disponibles
   */
  getAvailableDays(): DayOfWeek[] {
    return [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY
    ];
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