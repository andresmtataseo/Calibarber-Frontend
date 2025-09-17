import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { AppointmentService } from '../../../../appointment/services/appointment.service';
import { UserService } from '../../../../user/services/user.service';
import { ServiceService } from '../../../../service/services/service.service';
import { BarberService } from '../../../../barber/services/barber.service';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { CreateAppointmentRequest } from '../../../../appointment/models/appointment.model';
import { UserResponse } from '../../../../user/models/user.model';
import { BarberResponse } from '../../../../barber/models/barber.model';
import { ServiceResponseDto } from '../../../../../shared/models/service.models';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './appointment-create.component.html'
})
export class AppointmentCreateComponent implements OnInit {
  appointmentForm!: FormGroup;
  isSubmitting = false;

  // Data properties
  clients: UserResponse[] = [];
  barbers: BarberResponse[] = [];
  services: ServiceResponseDto[] = [];
  isLoading = false;
  loadingTimeSlots = false;
  
  // Additional properties for component functionality
  minDate: string = '';
  availableTimeSlots: string[] = [];
  selectedService: ServiceResponseDto | null = null;
  availableServices: ServiceResponseDto[] = [];
  availableUsers: UserResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private serviceService: ServiceService,
    private barberService: BarberService,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
    this.setMinDate();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      userId: ['', [Validators.required]], // Changed from clientId to userId to match backend
      barberId: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      appointmentDateTime: ['', [Validators.required]], // Combined date and time field
      notes: ['']
    });
  }

  private setMinDate(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  getMinDateTime(): string {
    const now = new Date();
    // Add 1 hour to current time to ensure appointment is in the future
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      this.loadClients();
      this.loadBarbers();
      this.loadServices();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private loadClients(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        // Handle paginated response structure
        const allUsers = response.data?.content || response.data || [];
        this.availableUsers = Array.isArray(allUsers) ? allUsers : [];
        this.clients = this.availableUsers.filter((user: UserResponse) => user.role === 'ROLE_CLIENT');
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
      }
    });
  }

  private loadBarbers(): void {
    this.isLoading = true;
    this.barberService.getAllBarbers().subscribe({
      next: (response) => {
        this.barbers = response.data?.content || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading barbers:', error);
        this.isLoading = false;
      }
    });
  }

  private loadServices(): void {
    this.isLoading = true;
    this.serviceService.getAllServices().subscribe({
      next: (response) => {
        this.services = response.data?.content || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  get f() {
    return this.appointmentForm.controls;
  }

  onBarberChange(): void {
    // Limpiar horarios disponibles cuando cambie el barbero
    this.availableTimeSlots = [];
    this.appointmentForm.patchValue({ appointmentTime: '' });

    // Si hay fecha y barbero seleccionados, cargar horarios
    if (this.f['appointmentDate'].value && this.f['barberId'].value) {
      this.loadAvailableTimeSlots();
    }
  }

  onServiceChange(): void {
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    console.log('Service ID selected:', serviceId);
    console.log('Available services:', this.services);
    
    if (serviceId) {
      // Handle both id and serviceId properties for compatibility
      this.selectedService = this.services.find((s: ServiceResponseDto) => {
        const sId = s.serviceId || s.id;
        return String(sId) === String(serviceId);
      }) || null;
      console.log('Selected service:', this.selectedService);
    } else {
      this.selectedService = null;
    }
    this.availableTimeSlots = [];
  }

  onDateChange(): void {
    // Limpiar horarios disponibles cuando cambie la fecha
    this.availableTimeSlots = [];
    this.appointmentForm.patchValue({ appointmentTime: '' });

    // Si hay fecha y barbero seleccionados, cargar horarios
    if (this.f['appointmentDate'].value && this.f['barberId'].value) {
      this.loadAvailableTimeSlots();
    }
  }

  private loadAvailableTimeSlots(): void {
    const barberId = this.f['barberId'].value;
    const date = this.f['appointmentDate'].value;

    if (!barberId || !date) return;

    // Obtener el barbero seleccionado para validación
    const selectedBarber = this.barbers.find((barber: BarberResponse) => barber.barberId === barberId);
    if (!selectedBarber) {
      this.notificationService.error('Barbero no encontrado');
      return;
    }

    // Convertir la fecha a día de la semana (0=Domingo, 1=Lunes, etc.)
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0-6

    // Convertir a formato que espera el backend (MONDAY, TUESDAY, etc.)
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeekString = daysOfWeek[dayOfWeek];

    this.loadingTimeSlots = true;

    // Usar el nuevo endpoint de disponibilidad de barberos con el barberId correcto
    this.barberService.getBarberAvailability(barberId, dayOfWeekString).subscribe({
      next: (response) => {
        console.log('Respuesta de disponibilidad:', response);

        // Procesar la respuesta para extraer los horarios disponibles
        if (response.data && Array.isArray(response.data)) {
          // Generar slots de tiempo basados en la disponibilidad del barbero
          this.availableTimeSlots = [];

          response.data.forEach((availability: any) => {
            if (availability.isAvailable) {
              // Generar slots de 30 minutos entre startTime y endTime
              const slots = this.generateTimeSlots(availability.startTime, availability.endTime);
              this.availableTimeSlots.push(...slots);
            }
          });

          // Remover duplicados y ordenar
          this.availableTimeSlots = [...new Set(this.availableTimeSlots)].sort();
        } else {
          this.availableTimeSlots = [];
        }
        this.loadingTimeSlots = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidad del barbero:', error);
        this.notificationService.error('Error al cargar los horarios disponibles. Verifique que el barbero tenga horarios configurados.');
        this.availableTimeSlots = [];
        this.loadingTimeSlots = false;
      }
    });
  }

  /**
   * Genera slots de tiempo de 30 minutos entre una hora de inicio y fin
   * @param startTime Hora de inicio en formato HH:mm:ss
   * @param endTime Hora de fin en formato HH:mm:ss
   * @returns Array de strings con los horarios disponibles
   */
  private generateTimeSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = [];

    // Convertir las horas a objetos Date para facilitar el cálculo
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    // Generar slots de 30 minutos
    const current = new Date(start);
    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5); // HH:mm
      slots.push(timeString);

      // Agregar 30 minutos
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }

  // Método para obtener el nombre completo del barbero
  getBarberFullName(barber: BarberResponse): string {
    // Buscar los datos del usuario asociado al barbero
    const user = this.availableUsers.find(u => u.userId === barber.userId);
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return `Barbero ${barber.barberId}`;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.appointmentForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.appointmentForm.value;
      console.log('Form values on submit:', formValue);
      console.log('Selected service on submit:', this.selectedService);
      
      // Comprehensive validation for service selection
      if (!this.isValidServiceSelection(formValue.serviceId)) {
        this.handleInvalidServiceSelection();
        return;
      }

      // Validate that the appointment date is in the future
      const appointmentDate = new Date(formValue.appointmentDateTime);
      if (!this.isValidAppointmentDate(appointmentDate)) {
        this.notificationService.error('La fecha de la cita debe ser en el futuro');
        this.isSubmitting = false;
        return;
      }
      
      // Create appointment request object with proper validation
      const appointmentRequest: CreateAppointmentRequest = {
        userId: this.validateAndFormatId(formValue.userId, 'Usuario'),
        barberId: this.validateAndFormatId(formValue.barberId, 'Barbero'),
        serviceId: this.validateAndFormatId(formValue.serviceId, 'Servicio'),
        appointmentDateTime: this.appointmentService.formatDateTimeForApi(appointmentDate),
        durationMinutes: this.selectedService!.durationMinutes || 30,
        price: Number(this.selectedService!.price.toFixed(2)),
        notes: formValue.notes || ''
      };

      console.log('Appointment request being sent:', appointmentRequest);

      this.appointmentService.createAppointment(appointmentRequest).subscribe({
        next: (response) => {
          console.log('Appointment created successfully:', response);
          this.notificationService.success('Cita creada exitosamente');
          this.router.navigate(['/admin/appointments']);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.handleAppointmentCreationError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleAppointmentCreationError(error: any): void {
    // Show user-friendly error message
    let errorMessage = 'Error al crear la cita';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.notificationService.error(errorMessage);
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.router.navigate(['/admin/appointments']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  // Clean code validation methods
  private isValidServiceSelection(serviceId: any): boolean {
    console.log('Service validation - serviceId:', serviceId);
    console.log('Service validation - selectedService:', this.selectedService);
    console.log('Service validation - hasPrice:', this.selectedService?.price);
    console.log('Service validation - priceValue:', this.selectedService?.price);
    
    if (!serviceId || serviceId === 'undefined' || serviceId === '') {
      console.log('Service validation failed: Invalid serviceId');
      return false;
    }
    
    if (!this.selectedService) {
      console.log('Service validation failed: No selected service');
      return false;
    }
    
    // Check if the serviceId matches the selected service
    const selectedServiceId = this.selectedService.serviceId || this.selectedService.id;
    if (String(selectedServiceId) !== String(serviceId)) {
      console.log('Service validation failed: ID mismatch');
      return false;
    }
    
    return true;
  }

  private handleInvalidServiceSelection(): void {
    console.error('Service validation failed:', {
      serviceId: this.appointmentForm.get('serviceId')?.value,
      selectedService: this.selectedService,
      hasPrice: this.selectedService?.price,
      priceValue: this.selectedService?.price
    });
    this.notificationService.error('Debe seleccionar un servicio válido con precio');
    this.isSubmitting = false;
  }

  private isValidAppointmentDate(appointmentDate: Date): boolean {
    const now = new Date();
    return appointmentDate > now;
  }

  private validateAndFormatId(id: any, fieldName: string): string {
    // Handle null, undefined, or empty values
    if (!id || id === '' || id === 'undefined' || id === null) {
      console.error(`${fieldName} ID is invalid:`, id);
      throw new Error(`${fieldName} ID no puede estar vacío`);
    }

    // Convert to string and validate it's not 'undefined'
    const stringId = String(id);
    if (stringId === 'undefined' || stringId === 'null') {
      console.error(`${fieldName} ID converted to invalid string:`, stringId);
      throw new Error(`${fieldName} ID no es válido`);
    }

    return stringId;
  }
}
