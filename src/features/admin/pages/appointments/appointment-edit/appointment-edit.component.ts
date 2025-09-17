import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Models
import { AppointmentResponse, UpdateAppointmentRequest } from '../../../../appointment/models/appointment.model';
import { UserResponse } from '../../../../user/models/user.model';
import { ServiceResponseDto } from '../../../../../shared/models/service.models';

// Services
import { AppointmentService } from '../../../../appointment/services/appointment.service';
import { UserService } from '../../../../user/services/user.service';
import { ServiceService } from '../../../../service/services/service.service';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';

// Components
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PreloaderComponent
  ],
  templateUrl: './appointment-edit.component.html'
})
export class AppointmentEditComponent implements OnInit {
  appointmentForm!: FormGroup;
  loading = false;
  isSubmitting = false;
  loadingTimeSlots = false;
  appointmentId!: string;
  currentAppointment: AppointmentResponse | null = null;

  // Data properties
  availableClients: UserResponse[] = [];
  availableBarbers: UserResponse[] = [];
  availableServices: ServiceResponseDto[] = [];
  availableTimeSlots: string[] = [];

  // Configuration
  minDate: string;
  appointmentStatuses = [
    { value: 'SCHEDULED', label: 'Programada' },
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'NO_SHOW', label: 'No se presentó' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private serviceService: ServiceService,
    private notificationService: NotificationService
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.initializeForm();
  }

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.appointmentId) {
      this.notificationService.error('ID de cita no válido');
      this.router.navigate(['/admin/appointments']);
      return;
    }

    this.loadInitialData();
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      clientId: ['', [Validators.required]],
      barberId: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      appointmentTime: ['', [Validators.required]],
      status: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      // Load appointment data first
      await this.loadAppointmentData();

      // Load all required data in parallel
      await Promise.all([
        this.loadClients(),
        this.loadBarbers(),
        this.loadServices()
      ]);

      // Populate form with appointment data
      this.populateForm();

    } catch (error) {
      console.error('Error loading initial data:', error);
      this.notificationService.error('Error al cargar los datos iniciales');
    } finally {
      this.loading = false;
    }
  }

  private async loadAppointmentData(): Promise<void> {
    try {
      this.currentAppointment = await this.appointmentService.getAppointmentById(this.appointmentId).toPromise();
      if (!this.currentAppointment) {
        throw new Error('Cita no encontrada');
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      this.notificationService.error('Error al cargar la cita');
      this.router.navigate(['/admin/appointments']);
      throw error;
    }
  }

  private async loadClients(): Promise<void> {
    try {
      const response = await this.userService.getAllUsers(0, 100, 'firstName', 'asc').toPromise();
      this.availableClients = response?.data?.content?.filter((user: UserResponse) =>
        user.role === 'ROLE_CLIENT'
      ) || [];
    } catch (error) {
      console.error('Error loading clients:', error);
      this.notificationService.error('Error al cargar los clientes');
    }
  }

  private async loadBarbers(): Promise<void> {
    try {
      const response = await this.userService.getAllUsers(0, 100, 'firstName', 'asc').toPromise();
      this.availableBarbers = response?.data?.content?.filter((user: UserResponse) =>
        user.role === 'ROLE_BARBER'
      ) || [];
    } catch (error) {
      console.error('Error loading barbers:', error);
      this.notificationService.error('Error al cargar los barberos');
    }
  }

  private async loadServices(): Promise<void> {
    try {
      const response = await this.serviceService.getAllServices().toPromise();
      this.availableServices = response?.data?.content || [];
    } catch (error) {
      console.error('Error loading services:', error);
      this.notificationService.error('Error al cargar los servicios');
    }
  }

  private populateForm(): void {
    if (!this.currentAppointment) return;

    // Use separate date and time fields from the model
    this.appointmentForm.patchValue({
      clientId: this.currentAppointment.userId,
      barberId: this.currentAppointment.barberId,
      serviceId: this.currentAppointment.serviceId,
      appointmentDate: this.currentAppointment.appointmentDateTime?.split('T')[0] || '',
      appointmentTime: this.currentAppointment.appointmentDateTime?.split('T')[1]?.substring(0, 5) || '',
      status: this.currentAppointment.status,
      notes: this.currentAppointment.notes || ''
    });

    // Load available time slots for the current date and barber
    this.loadAvailableTimeSlots();
  }

  onBarberChange(): void {
    // Reset time when barber changes
    this.appointmentForm.patchValue({ appointmentTime: '' });
    this.loadAvailableTimeSlots();
  }

  onServiceChange(): void {
    // Could implement service-specific logic here if needed
    this.loadAvailableTimeSlots();
  }

  onDateChange(): void {
    // Reset time when date changes
    this.appointmentForm.patchValue({ appointmentTime: '' });
    this.loadAvailableTimeSlots();
  }

  private async loadAvailableTimeSlots(): Promise<void> {
    const barberId = this.appointmentForm.get('barberId')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;
    const serviceId = this.appointmentForm.get('serviceId')?.value;

    if (!barberId || !appointmentDate || !serviceId) {
      this.availableTimeSlots = [];
      return;
    }

    this.loadingTimeSlots = true;
    try {
      // Generate time slots (this could be replaced with an API call)
      this.availableTimeSlots = this.generateTimeSlots();

      // If editing existing appointment, ensure current time is available
      if (this.currentAppointment) {
        const currentTime = this.currentAppointment.appointmentDateTime?.split('T')[1]?.substring(0, 5) || '';
        if (currentTime && !this.availableTimeSlots.includes(currentTime)) {
          this.availableTimeSlots.push(currentTime);
          this.availableTimeSlots.sort();
        }
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      this.notificationService.error('Error al cargar los horarios disponibles');
    } finally {
      this.loadingTimeSlots = false;
    }
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }

    return slots;
  }

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const formValue = this.appointmentForm.value;

      const updateRequest: UpdateAppointmentRequest = {
        appointmentDateTime: `${formValue.appointmentDate}T${formValue.appointmentTime}:00`,
        status: formValue.status,
        notes: formValue.notes || null
      };

      await this.appointmentService.updateAppointment(this.appointmentId, updateRequest).toPromise();

      this.notificationService.success('Cita actualizada exitosamente');
      this.router.navigate(['/admin/appointments']);

    } catch (error) {
      console.error('Error updating appointment:', error);
      this.notificationService.error('Error al actualizar la cita');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/appointments']);
  }

  // Form helper methods
  get f() {
    return this.appointmentForm.controls;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.appointmentForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
