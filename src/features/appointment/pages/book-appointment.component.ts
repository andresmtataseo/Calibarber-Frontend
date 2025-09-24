import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { DayAvailability, AvailabilityStatus, DayAvailabilitySlot, BarberAvailability, CreateAppointmentRequest } from '../models/appointment.model';
import { ServiceService } from '../../service/services/service.service';
import { ServiceResponseDto } from '../../../shared/models/service.models';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/components/notification/notification.service';
import { NotificationContainerComponent } from '../../../shared/components/notification/notification-container.component';
import { PreloaderComponent } from '../../../shared/components/preloader/preloader.component';

interface TimeSlot {
  time: string;
  available: boolean;
  displayTime: string;
}

interface CalendarDay {
  date: number;
  dayName: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
  fullDate: Date;
  availabilityStatus?: AvailabilityStatus;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationContainerComponent, PreloaderComponent],
  templateUrl: './book-appointment.component.html'
})
export class BookAppointmentComponent implements OnInit {
  selectedDate: CalendarDay | null = null;
  selectedServices: ServiceResponseDto[] = [];

  // Calendar navigation
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  isLoading: boolean = false;

  // Time slots management
  timeSlots: TimeSlot[] = [];
  selectedTimeSlot: string | null = null;
  selectedTimePeriod: 'Mañana' | 'Tarde' | 'Noche' = 'Mañana';
  timePeriods: ('Mañana' | 'Tarde' | 'Noche')[] = ['Mañana', 'Tarde', 'Noche'];
  currentTimePeriodIndex: number = 0;
  isLoadingTimeSlots: boolean = false;

  // Barbers availability management
  barbersAvailability: BarberAvailability[] = [];
  selectedBarber: BarberAvailability | null = null;
  isLoadingBarbers: boolean = false;
  currentBarberIndex: number = 0;
  barbersPerPage: number = 3; // Número de barberos a mostrar por página

  availableServices: ServiceResponseDto[] = [];
  isLoadingServices: boolean = false;
  currentServiceIndex: number = 0;
  servicesPerPage: number = 3; // Número de servicios a mostrar por página

  // Appointment creation state
  isCreatingAppointment: boolean = false;

  // Notes for the appointment
  appointmentNotes: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private serviceService: ServiceService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load available services
    this.loadAvailableServices();

    // Initialize current date to start from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.currentDate = today;

    // Load initial availability
    this.loadWeekAvailability();
  }

  /**
   * Extrae el mensaje de éxito de la respuesta de la API
   * @param response - Respuesta de la API
   * @param defaultMessage - Mensaje por defecto si no se encuentra mensaje específico
   * @returns Mensaje de éxito a mostrar
   */
  private getSuccessMessage(response: any, defaultMessage: string): string {
    // Intentar extraer el mensaje de diferentes estructuras de respuesta comunes
    if (response?.message) {
      return response.message;
    }
    if (response?.data?.message) {
      return response.data.message;
    }
    if (response?.success && typeof response.success === 'string') {
      return response.success;
    }

    // Si no se encuentra mensaje específico, retornar el mensaje por defecto
    return defaultMessage;
  }

  /**
   * Extrae el mensaje de error de la respuesta de la API
   * @param error - Error de la API
   * @param defaultMessage - Mensaje por defecto si no se encuentra mensaje específico
   * @returns Mensaje de error a mostrar
   */
  private getErrorMessage(error: any, defaultMessage: string): string {
    // Intentar extraer el mensaje de diferentes estructuras de error comunes
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.error?.error) {
      return error.error.error;
    }
    if (error?.error && typeof error.error === 'string') {
      return error.error;
    }
    if (typeof error === 'string') {
      return error;
    }

    // Si no se encuentra mensaje específico, retornar el mensaje por defecto
    return defaultMessage;
  }

  /**
   * Carga los servicios disponibles usando el ServiceService
   */
  async loadAvailableServices(): Promise<void> {
    this.isLoadingServices = true;

    try {
      const response = await this.serviceService.getAllServices().toPromise();

      if (response && response.data && response.data.content) {
        this.availableServices = response.data.content;

        // Mostrar notificación de éxito solo si hay servicios
        if (this.availableServices.length > 0) {
        }
      } else {
        this.availableServices = [];
        this.notificationService.warning('No se encontraron servicios disponibles');
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error, 'Error al cargar los servicios disponibles');
      this.notificationService.error(errorMessage);
      this.availableServices = [];
    } finally {
      this.isLoadingServices = false;
    }
  }

  /**
   * Genera los días del calendario para mostrar un rango de 7 días a partir de la fecha actual
   */
  private generateWeekDays(): CalendarDay[] {
    const days: CalendarDay[] = [];
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentDate);
      date.setDate(this.currentDate.getDate() + i);

      const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.

      days.push({
        date: date.getDate(),
        dayName: dayNames[dayOfWeek],
        available: true, // Se actualizará con los datos del servicio
        status: 'available', // Se actualizará con los datos del servicio
        fullDate: new Date(date)
      });
    }

    return days;
  }

  /**
   * Carga la disponibilidad para la semana actual
   */
  public loadWeekAvailability(): void {
    this.isLoading = true;

    // Generar los días de la semana
    this.calendarDays = this.generateWeekDays();

    // Calcular fechas de inicio y fin del rango de 7 días
    const startDate = this.formatDateForApi(this.currentDate);
    const endDate = new Date(this.currentDate);
    endDate.setDate(this.currentDate.getDate() + 6);
    const endDateStr = this.formatDateForApi(endDate);

    // Hacer la petición al servicio
    this.appointmentService.getBarbershopAvailability(startDate, endDateStr)
      .subscribe({
        next: (response: DayAvailability[]) => {
          this.updateCalendarWithAvailability(response);
          this.isLoading = false;
        },
        error: (error) => {
          const errorMessage = this.getErrorMessage(error, 'Error al cargar la disponibilidad. Intenta nuevamente.');
          this.notificationService.error(errorMessage);
          this.isLoading = false;
          // En caso de error, mantener los días generados con estado por defecto
        }
      });
  }

  /**
   * Actualiza el calendario con los datos de disponibilidad del servicio
   */
  private updateCalendarWithAvailability(availability: DayAvailability[]): void {
    this.calendarDays = this.calendarDays.map(day => {
      const dayAvailability = availability.find(avail => {
        // Comparar usando el formato yyyy-MM-dd directamente
        const dayFormatted = this.formatDateForApi(day.fullDate);
        return dayFormatted === avail.date;
      });

      if (dayAvailability) {
        return {
          ...day,
          availabilityStatus: dayAvailability.status,
          available: dayAvailability.status !== AvailabilityStatus.SIN_DISPONIBILIDAD,
          status: this.mapAvailabilityStatusToVisualStatus(dayAvailability.status)
        };
      }

      return day;
    });
  }

  /**
   * Mapea el estado de disponibilidad del backend al estado visual del frontend
   */
  private mapAvailabilityStatusToVisualStatus(status: AvailabilityStatus): 'available' | 'busy' | 'unavailable' {
    switch (status) {
      case AvailabilityStatus.LIBRE:
        return 'available';
      case AvailabilityStatus.PARCIALMENTE_DISPONIBLE:
        return 'busy';
      case AvailabilityStatus.SIN_DISPONIBILIDAD:
        return 'unavailable';
      default:
        return 'unavailable';
    }
  }

  /**
   * Formatea una fecha para la API (yyyy-MM-dd)
   */
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Navega al día anterior
   */
  goToPreviousWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(this.currentDate.getDate() - 1);

    // No permitir navegar a fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate >= today) {
      this.currentDate = newDate;
      this.loadWeekAvailability();
    }
  }

  /**
   * Navega al día siguiente
   */
  goToNextWeek(): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(this.currentDate.getDate() + 1);
    this.currentDate = newDate;
    this.loadWeekAvailability();
  }

  /**
   * Verifica si se puede navegar al día anterior
   */
  canGoToPreviousWeek(): boolean {
    const previousDay = new Date(this.currentDate);
    previousDay.setDate(this.currentDate.getDate() - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return previousDay >= today;
  }

  /**
   * Obtiene el texto del rango de fechas actual (7 días)
   */
  getWeekRangeText(): string {
    const endDate = new Date(this.currentDate);
    endDate.setDate(this.currentDate.getDate() + 6);

    const startMonth = this.currentDate.toLocaleDateString('es-ES', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('es-ES', { month: 'short' });
    const year = this.currentDate.getFullYear();

    if (startMonth === endMonth) {
      return `${this.currentDate.getDate()} - ${endDate.getDate()} ${startMonth} ${year}`;
    } else {
      return `${this.currentDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${year}`;
    }
  }

  /**
   * Obtiene el mes y año para mostrar en el encabezado
   */
  getMonthYearText(): string {
    const endDate = new Date(this.currentDate);
    endDate.setDate(this.currentDate.getDate() + 6);

    const startMonth = this.currentDate.toLocaleDateString('es-ES', { month: 'long' });
    const endMonth = endDate.toLocaleDateString('es-ES', { month: 'long' });
    const startYear = this.currentDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Capitalizar la primera letra del mes
    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    if (startMonth === endMonth && startYear === endYear) {
      // Misma mes y año
      return `${capitalizeFirst(startMonth)} ${startYear}`;
    } else if (startYear === endYear) {
      // Mismo año, diferentes meses
      return `${capitalizeFirst(startMonth)} - ${capitalizeFirst(endMonth)} ${startYear}`;
    } else {
      // Diferentes años
      return `${capitalizeFirst(startMonth)} ${startYear} - ${capitalizeFirst(endMonth)} ${endYear}`;
    }
  }

  selectDate(day: CalendarDay): void {
    if (day.available && !this.isLoading) {
      this.selectedDate = day;
      this.selectedTimeSlot = ''; // Reset selected time slot
      this.selectedBarber = null; // Reset selected barber
      this.selectedServices = []; // Reset selected services
      this.barbersAvailability = []; // Clear barbers list
      this.loadDayTimeSlots(); // Load time slots for the selected date
    }
  }

  /**
   * Loads time slots for the selected day
   */
  async loadDayTimeSlots(): Promise<void> {
    if (!this.selectedDate?.fullDate) {
      this.timeSlots = [];
      return;
    }

    this.isLoadingTimeSlots = true;

    try {
      const dateString = this.selectedDate.fullDate.toISOString().split('T')[0];
      const response = await this.appointmentService.getDayAvailabilityBySlots('1', dateString).toPromise();

      if (response && response.slots) {
        this.processTimeSlots(response.slots);

        // Mostrar notificación de éxito solo si hay slots disponibles
        const availableSlots = response.slots.filter(slot => slot.available);
        if (availableSlots.length > 0) {
        } else {
          this.notificationService.info('No hay horarios disponibles para esta fecha');
        }
      } else {
        this.timeSlots = [];
        this.notificationService.warning('No se encontraron horarios para la fecha seleccionada');
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error, 'Error al cargar los horarios disponibles');
      this.notificationService.error(errorMessage);
      this.timeSlots = [];
    } finally {
      this.isLoadingTimeSlots = false;
    }
  }

  /**
   * Procesa los slots de tiempo del backend y los organiza por período
   */
  private processTimeSlots(slots: DayAvailabilitySlot[]): void {
    const processedSlots: TimeSlot[] = slots.map(slot => ({
      time: slot.time,
      available: slot.available,
      displayTime: this.formatTimeForDisplay(slot.time)
    }));

    // Filtrar slots por el período de tiempo actual
    this.timeSlots = this.filterSlotsByTimePeriod(processedSlots, this.selectedTimePeriod);
  }

  /**
   * Filtra los slots por período de tiempo
   */
  private filterSlotsByTimePeriod(slots: TimeSlot[], period: 'Mañana' | 'Tarde' | 'Noche'): TimeSlot[] {
    return slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);

      switch (period) {
        case 'Mañana':
          return hour >= 6 && hour < 12;
        case 'Tarde':
          return hour >= 12 && hour < 18;
        case 'Noche':
          return hour >= 18 && hour <= 23;
        default:
          return false;
      }
    });
  }

  /**
   * Convierte el tiempo del formato 24h (HH:mm:ss) al formato 12h para mostrar
   */
  private formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  }

  selectTimePeriod(period: 'Mañana' | 'Tarde' | 'Noche'): void {
    this.selectedTimePeriod = period;
    this.currentTimePeriodIndex = this.timePeriods.indexOf(period);
    this.selectedTimeSlot = ''; // Reset selected time slot
    this.selectedBarber = null; // Reset selected barber
    this.selectedServices = []; // Reset selected services
    this.barbersAvailability = []; // Clear barbers list

    // Si hay una fecha seleccionada, recargar los slots para el nuevo período
    if (this.selectedDate) {
      this.loadDayTimeSlots();
    }
  }

  /**
   * Navega al período de tiempo anterior
   */
  goToPreviousTimePeriod(): void {
    if (this.currentTimePeriodIndex > 0) {
      this.currentTimePeriodIndex--;
      this.selectTimePeriod(this.timePeriods[this.currentTimePeriodIndex]);
    }
  }

  /**
   * Navega al período de tiempo siguiente
   */
  goToNextTimePeriod(): void {
    if (this.currentTimePeriodIndex < this.timePeriods.length - 1) {
      this.currentTimePeriodIndex++;
      this.selectTimePeriod(this.timePeriods[this.currentTimePeriodIndex]);
    }
  }

  /**
   * Verifica si se puede navegar al período anterior
   */
  canGoToPreviousTimePeriod(): boolean {
    return this.currentTimePeriodIndex > 0;
  }

  /**
   * Verifica si se puede navegar al período siguiente
   */
  canGoToNextTimePeriod(): boolean {
    return this.currentTimePeriodIndex < this.timePeriods.length - 1;
  }

  selectTimeSlot(time: string): void {
    this.selectedTimeSlot = time;
    this.selectedBarber = null; // Reset selected barber
    this.selectedServices = []; // Reset selected services
    // Cargar disponibilidad de barberos cuando se selecciona un horario
    this.loadBarbersAvailability();
  }

  /**
   * Carga la disponibilidad de barberos para la fecha y hora seleccionada
   */
  async loadBarbersAvailability(): Promise<void> {
    if (!this.selectedDate?.fullDate || !this.selectedTimeSlot) {
      this.barbersAvailability = [];
      this.selectedBarber = null;
      return;
    }

    this.isLoadingBarbers = true;

    try {
      // Construir el dateTime en formato ISO
      const dateStr = this.selectedDate.fullDate.toISOString().split('T')[0];
      const timeStr = this.selectedTimeSlot + ':00'; // Agregar segundos
      const dateTime = `${dateStr}T${timeStr}`;

      const response = await this.appointmentService.getBarbersAvailability(dateTime).toPromise();

      if (response && response.barbers) {
        this.barbersAvailability = response.barbers;

        // Mostrar notificación de éxito
        const availableBarbers = response.barbers.filter(barber => barber.available);
        if (availableBarbers.length > 0) {
        } else {
          this.notificationService.info('No hay barberos disponibles para este horario');
        }
      } else {
        this.barbersAvailability = [];
        this.notificationService.warning('No se encontraron barberos para el horario seleccionado');
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error, 'Error al cargar la disponibilidad de barberos');
      this.notificationService.error(errorMessage);
      this.barbersAvailability = [];
    } finally {
      this.isLoadingBarbers = false;
    }
  }

  /**
   * Selecciona un barbero específico
   */
  selectBarber(barber: BarberAvailability): void {
    if (barber.available) {
      this.selectedBarber = barber;
      this.selectedServices = []; // Reset selected services
    }
  }

  /**
   * Obtiene el ID único de un servicio (maneja tanto id como serviceId)
   */
  private getServiceId(service: ServiceResponseDto): string {
    return service.serviceId || service.id || '';
  }

  /**
   * Verifica si un servicio está seleccionado
   */
  isServiceSelected(service: ServiceResponseDto): boolean {
    if (this.selectedServices.length === 0) return false;
    const serviceId = this.getServiceId(service);
    const selectedServiceId = this.getServiceId(this.selectedServices[0]);
    return serviceId === selectedServiceId;
  }

  /**
   * Selecciona un servicio (solo uno a la vez)
   */
  selectService(service: ServiceResponseDto): void {
    const isSelected = this.isServiceSelected(service);

    if (isSelected) {
      // Si está seleccionado, lo deseleccionamos
      this.selectedServices = [];
      this.notificationService.info('Servicio deseleccionado');
    } else {
      // Si no está seleccionado, reemplazamos la selección actual
      this.selectedServices = [service];
    }
  }

  getTotalPrice(): number {
    return this.selectedServices.length > 0 ? this.selectedServices[0].price : 0;
  }

  async makeReservation(): Promise<void> {
    // Validar que todos los campos necesarios estén seleccionados
    if (!this.selectedDate || !this.selectedTimeSlot || !this.selectedServices.length || !this.selectedBarber) {
      this.notificationService.warning('Por favor, selecciona todos los campos requeridos: fecha, hora, servicio y barbero.');
      return;
    }

    // Obtener el usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.notificationService.error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    this.isCreatingAppointment = true;

    try {
      // Construir el objeto de solicitud
      const appointmentRequest: CreateAppointmentRequest = {
        barberId: this.selectedBarber.id,
        userId: currentUser.id,
        serviceId: this.getServiceId(this.selectedServices[0]),
        appointmentDateTime: `${this.formatDateForApi(this.selectedDate.fullDate)}T${this.selectedTimeSlot}:00`,
        durationMinutes: this.selectedServices[0].durationMinutes,
        price: this.selectedServices[0].price,
        notes: this.appointmentNotes.trim() || undefined
      };

      // Llamar al servicio para crear la cita
      const createdAppointment = await this.appointmentService.createAppointment(appointmentRequest).toPromise();

      // Resetear el formulario después de crear la cita exitosamente
      this.resetForm();

      // Mostrar mensaje de éxito usando el mensaje del backend
      const successMessage = this.getSuccessMessage(createdAppointment, '¡Cita creada exitosamente!');
      this.notificationService.success(successMessage);

      // Redirigir al perfil del usuario después de una reserva exitosa
      this.router.navigate(['/profile']);

    } catch (error) {
      const errorMessage = this.getErrorMessage(error, 'Error al crear la cita. Por favor, inténtalo de nuevo.');
      this.notificationService.error(errorMessage);
    } finally {
      this.isCreatingAppointment = false;
    }
  }

  /**
   * Resetea el formulario después de crear una cita exitosamente
   */
  private resetForm(): void {
    this.selectedDate = null;
    this.selectedTimeSlot = null;
    this.selectedServices = [];
    this.selectedBarber = null;
    this.appointmentNotes = ''; // Reset notes field
    this.timeSlots = [];
    this.barbersAvailability = [];
  }

  // Métodos de navegación para barberos
  /**
   * Obtiene los barberos visibles en la página actual
   */
  getVisibleBarbers(): BarberAvailability[] {
    const startIndex = this.currentBarberIndex;
    const endIndex = startIndex + this.barbersPerPage;
    return this.barbersAvailability.slice(startIndex, endIndex);
  }

  /**
   * Navega a la página anterior de barberos
   */
  goToPreviousBarbers(): void {
    if (this.canGoToPreviousBarbers()) {
      this.currentBarberIndex = Math.max(0, this.currentBarberIndex - this.barbersPerPage);
    }
  }

  /**
   * Navega a la página siguiente de barberos
   */
  goToNextBarbers(): void {
    if (this.canGoToNextBarbers()) {
      this.currentBarberIndex = Math.min(
        this.barbersAvailability.length - this.barbersPerPage,
        this.currentBarberIndex + this.barbersPerPage
      );
    }
  }

  /**
   * Verifica si se puede navegar a la página anterior de barberos
   */
  canGoToPreviousBarbers(): boolean {
    return this.currentBarberIndex > 0;
  }

  /**
   * Verifica si se puede navegar a la página siguiente de barberos
   */
  canGoToNextBarbers(): boolean {
    return this.currentBarberIndex + this.barbersPerPage < this.barbersAvailability.length;
  }

  // Métodos de navegación para servicios
  /**
   * Obtiene los servicios visibles en la página actual
   */
  getVisibleServices(): ServiceResponseDto[] {
    const startIndex = this.currentServiceIndex;
    const endIndex = startIndex + this.servicesPerPage;
    return this.availableServices.slice(startIndex, endIndex);
  }

  /**
   * Navega a la página anterior de servicios
   */
  goToPreviousServices(): void {
    if (this.canGoToPreviousServices()) {
      this.currentServiceIndex = Math.max(0, this.currentServiceIndex - this.servicesPerPage);
    }
  }

  /**
   * Navega a la página siguiente de servicios
   */
  goToNextServices(): void {
    if (this.canGoToNextServices()) {
      this.currentServiceIndex = Math.min(
        this.availableServices.length - this.servicesPerPage,
        this.currentServiceIndex + this.servicesPerPage
      );
    }
  }

  /**
   * Verifica si se puede navegar a la página anterior de servicios
   */
  canGoToPreviousServices(): boolean {
    return this.currentServiceIndex > 0;
  }

  /**
   * Verifica si se puede navegar a la página siguiente de servicios
   */
  canGoToNextServices(): boolean {
    return this.currentServiceIndex + this.servicesPerPage < this.availableServices.length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-success';
      case 'busy':
        return 'bg-warning';
      case 'unavailable':
        return 'bg-error';
      default:
        return 'bg-base-300';
    }
  }
}
