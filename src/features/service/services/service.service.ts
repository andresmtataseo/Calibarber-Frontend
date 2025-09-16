import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
  ServiceResponseDto,
  ServiceApiResponse,
  ServicesPageApiResponse,
  DeleteServiceApiResponse,
  ServiceSearchParams,
  ServicesByBarbershopParams,
  ServicesByNameParams,
  ServicesByPriceRangeParams,
  ServicesByDurationRangeParams
} from '../../../shared/models/service.models';
import { UrlService } from '../../../core/services/url.service';

/**
 * Servicio para la gestión de servicios de barbería
 * 
 * Proporciona métodos para realizar operaciones CRUD y búsquedas
 * sobre los servicios disponibles en las barberías.
 * 
 * @example
 * ```typescript
 * constructor(private serviceService: ServiceService) {}
 * 
 * // Crear un nuevo servicio
 * this.serviceService.createService(serviceData).subscribe(response => {
 *   console.log('Servicio creado:', response.data);
 * });
 * 
 * // Obtener servicios por barbería
 * this.serviceService.getServicesByBarbershop({ barbershopId: '123' }).subscribe(response => {
 *   console.log('Servicios:', response.data?.content);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly urlService = inject(UrlService);

  /**
   * Crea un nuevo servicio en una barbería específica
   * 
   * Permisos requeridos:
   * - ROLE_ADMIN: Puede crear servicios en cualquier barbería
   * - ROLE_BARBER: Solo puede crear servicios en su propia barbería
   * 
   * @param request Datos del servicio a crear
   * @returns Observable con el servicio creado
   */
  createService(request: CreateServiceRequestDto): Observable<ServiceResponseDto> {
    return this.http.post<ServiceApiResponse>(
      this.urlService.getServiceUrl('CREATE'),
      request
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos del servicio creado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene un servicio específico por su ID
   * 
   * @param serviceId ID del servicio a obtener
   * @returns Observable con los datos del servicio
   */
  getServiceById(serviceId: string): Observable<ServiceResponseDto> {
    const params = new HttpParams().set('serviceId', serviceId);
    
    return this.http.get<ServiceApiResponse>(
      this.urlService.getServiceUrl('BY_ID'),
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se encontró el servicio solicitado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene una lista paginada de todos los servicios disponibles
   * 
   * @param params Parámetros de paginación y ordenamiento
   * @returns Observable con la página de servicios
   */
  getAllServices(params: ServiceSearchParams = {}): Observable<ServicesPageApiResponse> {
    const httpParams = this.buildSearchParams(params);
    
    return this.http.get<ServicesPageApiResponse>(
      this.urlService.getServiceUrl('ALL'),
      { params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtiene todos los servicios de una barbería específica
   * 
   * @param params Parámetros incluyendo el ID de la barbería y opciones de paginación
   * @returns Observable con la página de servicios de la barbería
   */
  getServicesByBarbershop(params: ServicesByBarbershopParams): Observable<ServicesPageApiResponse> {
    const httpParams = this.buildSearchParams(params)
      .set('barbershopId', params.barbershopId);
    
    return this.http.get<ServicesPageApiResponse>(
      this.urlService.getServiceUrl('BY_BARBERSHOP'),
      { params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Busca servicios que contengan el nombre especificado
   * 
   * @param params Parámetros incluyendo el nombre a buscar y opciones de paginación
   * @returns Observable con la página de servicios encontrados
   */
  searchServicesByName(params: ServicesByNameParams): Observable<ServicesPageApiResponse> {
    const httpParams = this.buildSearchParams(params)
      .set('name', params.name);
    
    return this.http.get<ServicesPageApiResponse>(
      this.urlService.getServiceUrl('SEARCH_BY_NAME'),
      { params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Busca servicios dentro de un rango de precios específico
   * 
   * @param params Parámetros incluyendo el rango de precios y opciones de paginación
   * @returns Observable con la página de servicios encontrados
   */
  searchServicesByPriceRange(params: ServicesByPriceRangeParams): Observable<ServicesPageApiResponse> {
    const httpParams = this.buildSearchParams(params)
      .set('minPrice', params.minPrice.toString())
      .set('maxPrice', params.maxPrice.toString());
    
    return this.http.get<ServicesPageApiResponse>(
      this.urlService.getServiceUrl('SEARCH_BY_PRICE'),
      { params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Busca servicios dentro de un rango de duración específico
   * 
   * @param params Parámetros incluyendo el rango de duración y opciones de paginación
   * @returns Observable con la página de servicios encontrados
   */
  searchServicesByDurationRange(params: ServicesByDurationRangeParams): Observable<ServicesPageApiResponse> {
    const httpParams = this.buildSearchParams(params)
      .set('minDuration', params.minDuration.toString())
      .set('maxDuration', params.maxDuration.toString());
    
    return this.http.get<ServicesPageApiResponse>(
      this.urlService.getServiceUrl('SEARCH_BY_DURATION'),
      { params: httpParams }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualiza un servicio existente
   * 
   * Permisos requeridos:
   * - ROLE_ADMIN: Puede actualizar cualquier servicio
   * - ROLE_BARBER: Solo puede actualizar servicios de su propia barbería
   * 
   * @param id ID del servicio a actualizar
   * @param request Datos actualizados del servicio
   * @returns Observable con el servicio actualizado
   */
  updateService(id: string, request: UpdateServiceRequestDto): Observable<ServiceResponseDto> {
    const params = new HttpParams().set('id', id);
    
    return this.http.put<ServiceApiResponse>(
      this.urlService.getServiceUrl('UPDATE'),
      request,
      { params }
    ).pipe(
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos del servicio actualizado');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Elimina un servicio (soft delete)
   * 
   * Permisos requeridos:
   * - ROLE_ADMIN: Puede eliminar cualquier servicio
   * - ROLE_BARBER: Solo puede eliminar servicios de su propia barbería
   * 
   * @param id ID del servicio a eliminar
   * @returns Observable confirmando la eliminación
   */
  deleteService(id: string): Observable<void> {
    const params = new HttpParams().set('id', id);
    
    return this.http.delete<DeleteServiceApiResponse>(
      this.urlService.getServiceUrl('DELETE'),
      { params }
    ).pipe(
      map(() => void 0),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Restaura un servicio eliminado
   * 
   * Permisos requeridos:
   * - ROLE_ADMIN: Puede restaurar cualquier servicio eliminado
   * - ROLE_BARBER: Solo puede restaurar servicios eliminados de su propia barbería
   * 
   * @param serviceId ID del servicio a restaurar
   * @returns Observable confirmando la restauración
   */
  restoreService(serviceId: string): Observable<void> {
    const params = new HttpParams().set('serviceId', serviceId);
    
    return this.http.post<DeleteServiceApiResponse>(
      this.urlService.getServiceUrl('RESTORE'),
      {},
      { params }
    ).pipe(
      map(() => void 0),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Construye los parámetros HTTP para las búsquedas
   * 
   * @param params Parámetros de búsqueda
   * @returns HttpParams configurados
   */
  private buildSearchParams(params: ServiceSearchParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    
    if (params.sortDir) {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }
    
    return httpParams;
  }

  /**
   * Maneja errores de HTTP
   * 
   * @param error Error HTTP recibido
   * @returns Observable que emite el error procesado
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
          errorMessage = error.error?.message || 'Datos inválidos en la solicitud';
          break;
        case 401:
          errorMessage = 'No tienes autorización para realizar esta acción';
          break;
        case 403:
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
          break;
        case 404:
          errorMessage = 'El servicio solicitado no fue encontrado';
          break;
        case 409:
          errorMessage = 'Ya existe un servicio con estos datos';
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

    console.error('Service Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}