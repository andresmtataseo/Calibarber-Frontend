import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UrlService } from '../../../core/services/url.service';
import {
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentStatus,
  DayAvailability,
  DayAvailabilityResponse,
  BarbersAvailabilityResponse
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {}

  // ========== ENDPOINTS CRUD BÁSICOS ==========

  /**
   * Crea una nueva cita en el sistema
   * @param request Datos de la nueva cita a crear
   * @returns Observable con la respuesta de la API
   */
  createAppointment(request: CreateAppointmentRequest): Observable<any> {
    return this.http.post<any>(this.urlService.getAppointmentUrl('CREATE'), request);
  }

  /**
   * Obtiene los detalles de una cita específica por su ID
   * @param appointmentId ID único de la cita a consultar
   * @returns Observable con los detalles de la cita solicitada
   */
  getAppointmentById(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.get<any>(this.urlService.getAppointmentUrl('BY_ID'), { params });
  }

  /**
   * Obtiene todas las citas del sistema con paginación y ordenamiento
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @param searchTerm Término de búsqueda opcional
   * @param statusFilter Filtro de estado opcional
   * @returns Observable con la respuesta paginada de todas las citas
   */
  getAllAppointments(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDatetimeStart',
    sortDir: string = 'asc',
    searchTerm?: string,
    statusFilter?: AppointmentStatus | null
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    if (statusFilter) {
      params = params.set('status', statusFilter);
    }

    return this.http.get<any>(this.urlService.getAppointmentUrl('ALL'), { params });
  }

  /**
   * Actualiza los datos de una cita existente
   * @param appointmentId ID único de la cita a actualizar
   * @param request Datos actualizados de la cita
   * @returns Observable con los datos actualizados de la cita
   */
  updateAppointment(appointmentId: string, request: UpdateAppointmentRequest): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.put<any>(this.urlService.getAppointmentUrl('UPDATE'), request, { params });
  }

  /**
   * Elimina una cita del sistema de forma permanente
   * @param appointmentId ID único de la cita a eliminar
   * @returns Observable con la respuesta de confirmación de eliminación
   */
  deleteAppointment(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.delete<any>(this.urlService.getAppointmentUrl('DELETE'), { params });
  }

  // ========== ENDPOINTS DE CONSULTA POR FILTROS ==========

  /**
   * Obtiene todas las citas de un cliente específico con paginación
   * @param userId ID único del usuario
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la respuesta paginada de las citas del cliente
   */
  getAppointmentsByClient(
    userId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDatetimeStart',
    sortDir: string = 'desc'
  ): Observable<any> {
    const params = new HttpParams()
      .set('clientId', userId)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(this.urlService.getAppointmentUrl('BY_CLIENT'), { params });
  }

  /**
   * Obtiene todas las citas de un barbero específico con paginación
   * @param userId ID único del usuario (barbero)
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la respuesta paginada de las citas del barbero
   */
  getAppointmentsByBarber(
    userId: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDatetimeStart',
    sortDir: string = 'desc'
  ): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(this.urlService.getAppointmentUrl('BY_BARBER'), { params });
  }

  /**
   * Obtiene todas las citas filtradas por estado específico con paginación
   * @param status Estado específico de las citas a filtrar
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param sortBy Campo por el cual ordenar
   * @param sortDir Dirección del ordenamiento (asc/desc)
   * @returns Observable con la respuesta paginada de las citas filtradas por estado
   */
  getAppointmentsByStatus(
    status: AppointmentStatus,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'appointmentDatetimeStart',
    sortDir: string = 'desc'
  ): Observable<any> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<any>(this.urlService.getAppointmentUrl('BY_STATUS'), { params });
  }

  // ========== ENDPOINTS DE PRÓXIMAS CITAS ==========

  /**
   * Obtiene las próximas citas de un cliente específico
   * @param userId ID único del usuario
   * @returns Observable con las próximas citas del cliente
   */
  getUpcomingAppointmentsByClient(userId: string): Observable<any> {
    const params = new HttpParams().set('clientId', userId);
    return this.http.get<any>(this.urlService.getAppointmentUrl('UPCOMING_CLIENT'), { params });
  }

  /**
   * Obtiene las próximas citas de un barbero específico
   * @param userId ID único del usuario (barbero)
   * @returns Observable con las próximas citas del barbero
   */
  getUpcomingAppointmentsByBarber(userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<any>(this.urlService.getAppointmentUrl('UPCOMING_BARBER'), { params });
  }

  // ========== ENDPOINTS DE GESTIÓN DE ESTADOS ==========

  /**
   * Confirma una cita programada
   * @param appointmentId ID único de la cita a confirmar
   * @returns Observable con la respuesta de la API
   */
  confirmAppointment(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.patch<any>(this.urlService.getAppointmentUrl('CONFIRM'), {}, { params });
  }

  /**
   * Marca una cita como en progreso
   * @param appointmentId ID único de la cita a marcar como en progreso
   * @returns Observable con la respuesta de la API
   */
  startAppointment(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.patch<any>(this.urlService.getAppointmentUrl('START'), {}, { params });
  }

  /**
   * Marca una cita como completada
   * @param appointmentId ID único de la cita a marcar como completada
   * @returns Observable con la respuesta de la API
   */
  completeAppointment(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.patch<any>(this.urlService.getAppointmentUrl('COMPLETE'), {}, { params });
  }

  /**
   * Cancela una cita programada
   * @param appointmentId ID único de la cita a cancelar
   * @param reason Motivo de la cancelación
   * @returns Observable con la respuesta de la API
   */
  cancelAppointment(appointmentId: string, reason?: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    const body = reason ? { reason } : {};
    return this.http.patch<any>(this.urlService.getAppointmentUrl('CANCEL'), body, { params });
  }

  /**
   * Marca una cita como no asistida
   * @param appointmentId ID único de la cita a marcar como no asistida
   * @returns Observable con la respuesta de la API
   */
  markNoShow(appointmentId: string): Observable<any> {
    const params = new HttpParams().set('appointmentId', appointmentId);
    return this.http.patch<any>(this.urlService.getAppointmentUrl('NO_SHOW'), {}, { params });
  }

  // ========== ENDPOINTS DE DISPONIBILIDAD ==========

  /**
   * Verifica si un horario específico está disponible para un barbero
   * @param barberId ID único del barbero
   * @param date Fecha en formato yyyy-MM-dd
   * @param time Hora en formato HH:mm
   * @returns Observable con la respuesta de disponibilidad
   */
  checkTimeSlotAvailability(barberId: string, date: string, time: string): Observable<any> {
    const params = new HttpParams()
      .set('barberId', barberId)
      .set('date', date)
      .set('time', time);

    return this.http.get<any>(this.urlService.getAppointmentUrl('CHECK_AVAILABILITY'), { params });
  }

  // ========== ENDPOINTS DE ESTADÍSTICAS ==========

  /**
   * Obtiene estadísticas de citas para un período específico
   * @param startDate Fecha de inicio en formato yyyy-MM-dd
   * @param endDate Fecha de fin en formato yyyy-MM-dd
   * @returns Observable con las estadísticas de citas
   */
  getAppointmentStats(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(this.urlService.getAppointmentUrl('STATS'), { params });
  }

  // ========== ENDPOINTS DE DISPONIBILIDAD ==========

  /**
   * Obtiene la disponibilidad de un día específico en bloques de 30 minutos
   * @param barberId ID único del barbero
   * @param date Fecha en formato yyyy-MM-dd
   * @returns Observable con la disponibilidad del día en bloques de 30 minutos
   */
  getDayAvailabilityBySlots(barberId: string, date: string): Observable<DayAvailabilityResponse> {
    const params = new HttpParams()
      .set('barberId', barberId)
      .set('date', date);

    return this.http.get<any>(this.urlService.getAppointmentUrl('AVAILABILITY_DAY'), { params }).pipe(
      map((response: any) => {
        console.log('Respuesta completa del backend para slots:', response);
        if (response.status === 200 && response.data) {
          console.log('Extrayendo data de slots:', response.data);
          return response.data;
        }
        throw new Error('Error al obtener la disponibilidad de slots del día');
      }),
      catchError((error) => {
        console.error('Error al obtener la disponibilidad de slots:', error);
        return throwError(() => new Error('Error al obtener la disponibilidad de slots del día'));
      })
    );
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  /**
   * Convierte un objeto Date a formato ISO LocalDateTime para la API
   * @param date Objeto Date a convertir
   * @returns String en formato yyyy-MM-dd'T'HH:mm:ss
   */
  formatDateTimeForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  /**
   * Obtiene un texto descriptivo para un estado de cita
   * @param status Estado de la cita
   * @returns Texto descriptivo en español
   */
  getStatusText(status: AppointmentStatus): string {
    const statusMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: 'Programada',
      [AppointmentStatus.CONFIRMED]: 'Confirmada',
      [AppointmentStatus.IN_PROGRESS]: 'En progreso',
      [AppointmentStatus.COMPLETED]: 'Completada',
      [AppointmentStatus.CANCELLED]: 'Cancelada',
      [AppointmentStatus.NO_SHOW]: 'No asistió'
    };
    return statusMap[status] || 'Desconocido';
  }

  /**
   * Obtiene una clase CSS para un estado de cita
   * @param status Estado de la cita
   * @returns Clase CSS para aplicar estilo
   */
  getStatusClass(status: AppointmentStatus): string {
    const statusClassMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: 'badge-info',
      [AppointmentStatus.CONFIRMED]: 'badge-primary',
      [AppointmentStatus.IN_PROGRESS]: 'badge-warning',
      [AppointmentStatus.COMPLETED]: 'badge-success',
      [AppointmentStatus.CANCELLED]: 'badge-error',
      [AppointmentStatus.NO_SHOW]: 'badge-error'
    };
    return statusClassMap[status] || 'badge-neutral';
  }

  /**
   * Obtiene el total de citas del día actual
   * @returns Observable con el número total de citas del día
   */
  getTodayAppointmentsCount(): Observable<number> {
    return this.http.get<any>(this.urlService.getAppointmentUrl('COUNT_TODAY')).pipe(
      map((response: any) => {
        if (response.data !== undefined) {
          return response.data;
        }
        throw new Error('Error al obtener el total de citas del día');
      }),
      catchError((error) => {
        console.error('Error al obtener el conteo de citas del día:', error);
        return throwError(() => new Error('Error al obtener el total de citas del día'));
      })
    );
  }

  /**
   * Obtiene la disponibilidad de la barbería en un rango de fechas
   * @param startDate Fecha de inicio en formato yyyy-MM-dd
   * @param endDate Fecha de fin en formato yyyy-MM-dd
   * @returns Observable con la disponibilidad por días
   */
  getBarbershopAvailability(startDate: string, endDate: string): Observable<DayAvailability[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(this.urlService.getAppointmentUrl('AVAILABILITY'), { params }).pipe(
      map((response: any) => {
        console.log('Respuesta completa del backend:', response);
        if (response.status === 200 && response.data && response.data.availability) {
          console.log('Extrayendo availability:', response.data.availability);
          return response.data.availability;
        }
        throw new Error('Error al obtener la disponibilidad de la barbería');
      }),
      catchError((error) => {
        console.error('Error al obtener la disponibilidad:', error);
        return throwError(() => new Error('Error al obtener la disponibilidad de la barbería'));
      })
    );
  }

  /**
   * Obtiene la disponibilidad de todos los barberos para una fecha y hora específica
   * @param dateTime Fecha y hora en formato ISO (yyyy-MM-dd'T'HH:mm:ss)
   * @returns Observable con la disponibilidad de barberos y su tiempo libre
   */
  getBarbersAvailability(dateTime: string): Observable<BarbersAvailabilityResponse> {
    const params = new HttpParams().set('dateTime', dateTime);

    return this.http.get<BarbersAvailabilityResponse>(
      this.urlService.getAppointmentUrl('AVAILABILITY_BARBERS'),
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error al obtener la disponibilidad de barberos:', error);
        return throwError(() => new Error('Error al obtener la disponibilidad de barberos'));
      })
    );
  }
}


