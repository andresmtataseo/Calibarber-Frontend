import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../services/appointment.service';
import { AvailabilityResponse, DayAvailability, AvailabilityStatus, DayAvailabilityResponse, DayAvailabilitySlot } from '../models/appointment.model';

interface TimeSlot {
  time: string;
  available: boolean;
  displayTime: string; // Para mostrar en formato 12h
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  employee: string;
  personalized: boolean;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html'
})
export class BookAppointmentComponent implements OnInit {
  selectedDate: CalendarDay | null = null;
  selectedServices: Service[] = [];

  // Calendar navigation
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  // Time slots management
  timeSlots: TimeSlot[] = [];
  selectedTimeSlot: string | null = null;
  selectedTimePeriod: 'Mañana' | 'Tarde' | 'Noche' = 'Mañana';
  timePeriods: ('Mañana' | 'Tarde' | 'Noche')[] = ['Mañana', 'Tarde', 'Noche'];
  currentTimePeriodIndex: number = 0;
  isLoadingTimeSlots: boolean = false;
  timeSlotsError: string | null = null;

  // Hardcoded barberId for now - in a real app this would come from user selection
  private readonly BARBER_ID = '1';

  availableServices: Service[] = [
    {
      id: '1',
      name: 'Corte de cabello regular',
      duration: '35 min',
      price: 35.00,
      employee: 'Cualquiera',
      personalized: false
    },
    {
      id: '2',
      name: 'Corte de cabello regular',
      duration: '35 min',
      price: 35.00,
      employee: 'Cualquiera',
      personalized: false
    }
  ];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // Initialize with first available service
    this.selectedServices = [this.availableServices[0]];

    // Initialize current date to start from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.currentDate = today;

    // Load initial availability
    this.loadWeekAvailability();
  }

  /**
   * Obtiene el inicio de la semana (lunes) para una fecha dada
   */
  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
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
    this.error = null;

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
          console.log('Respuesta del backend:', response);
          this.updateCalendarWithAvailability(response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar disponibilidad:', error);
          this.error = 'Error al cargar la disponibilidad. Intenta nuevamente.';
          this.isLoading = false;
          // En caso de error, mantener los días generados con estado por defecto
        }
      });
  }

  /**
   * Actualiza el calendario con los datos de disponibilidad del servicio
   */
  private updateCalendarWithAvailability(availability: DayAvailability[]): void {
    console.log('Actualizando calendario con disponibilidad:', availability);
    console.log('Días del calendario antes de actualizar:', this.calendarDays);

    this.calendarDays = this.calendarDays.map(day => {
      const dayAvailability = availability.find(avail => {
        // Comparar usando el formato yyyy-MM-dd directamente
        const dayFormatted = this.formatDateForApi(day.fullDate);
        console.log(`Comparando: ${dayFormatted} con ${avail.date}`);
        return dayFormatted === avail.date;
      });

      if (dayAvailability) {
        console.log(`Encontrada disponibilidad para ${day.fullDate.toDateString()}: ${dayAvailability.status}`);
        return {
          ...day,
          availabilityStatus: dayAvailability.status,
          available: dayAvailability.status !== AvailabilityStatus.SIN_DISPONIBILIDAD,
          status: this.mapAvailabilityStatusToVisualStatus(dayAvailability.status)
        };
      }

      console.log(`No se encontró disponibilidad para ${day.fullDate.toDateString()}`);
      return day;
    });

    console.log('Días del calendario después de actualizar:', this.calendarDays);
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
    this.timeSlotsError = null;

    try {
      const dateString = this.selectedDate.fullDate.toISOString().split('T')[0];
      console.log('Cargando slots para fecha:', dateString);
      
      const response = await this.appointmentService.getDayAvailabilityBySlots('1', dateString).toPromise();
      console.log('Respuesta recibida en componente:', response);
      
      if (response && response.slots) {
        console.log('Slots encontrados:', response.slots.length);
        this.processTimeSlots(response.slots);
      } else {
        console.log('No se encontraron slots en la respuesta');
        this.timeSlots = [];
      }
    } catch (error) {
      console.error('Error loading day time slots:', error);
      this.timeSlotsError = 'Error al cargar los horarios disponibles';
      this.timeSlots = [];
    } finally {
      this.isLoadingTimeSlots = false;
    }
  }

  /**
   * Procesa los slots de tiempo del backend y los organiza por período
   */
  private processTimeSlots(slots: DayAvailabilitySlot[]): void {
    console.log('Procesando slots recibidos:', slots);
    
    const processedSlots: TimeSlot[] = slots.map(slot => ({
      time: slot.time,
      available: slot.available,
      displayTime: this.formatTimeForDisplay(slot.time)
    }));

    console.log('Slots procesados:', processedSlots);
    console.log('Período seleccionado:', this.selectedTimePeriod);

    // Filtrar slots por el período de tiempo actual
    this.timeSlots = this.filterSlotsByTimePeriod(processedSlots, this.selectedTimePeriod);
    console.log('Slots filtrados para', this.selectedTimePeriod, ':', this.timeSlots);
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
  }

  addService(): void {
    // Logic to add another service
    console.log('Add service clicked');
  }

  changeEmployee(serviceId: string): void {
    // Logic to change employee for a service
    console.log('Change employee for service:', serviceId);
  }

  getTotalPrice(): number {
    return this.selectedServices.reduce((total, service) => total + service.price, 0);
  }

  makeReservation(): void {
    if (this.selectedDate && this.selectedTimeSlot && this.selectedServices.length > 0) {
      console.log('Making reservation:', {
        date: this.selectedDate,
        timeSlot: this.selectedTimeSlot,
        timePeriod: this.selectedTimePeriod,
        services: this.selectedServices,
        total: this.getTotalPrice()
      });
      // Here you would call the appointment service to create the reservation
    }
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
