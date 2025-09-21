import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PreloaderComponent } from '../../../../shared/components/preloader/preloader.component';
import { UserResponse, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UrlService } from '../../../../core/services/url.service';
import { NotificationService } from '../../../../shared/components/notification/notification.service';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../appointment/models/appointment.model';
import { PageableResponse } from '../../../../shared/models/service.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PreloaderComponent, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly urlService = inject(UrlService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly appointmentService = inject(AppointmentService);

  private destroy$ = new Subject<void>();
  user: UserResponse | null = null;
  loading = false;
  upcomingAppointments: AppointmentResponse[] = [];
  loadingAppointments = false;
  cancellingAppointment: string | null = null;
  confirmingAppointment: string | null = null;
  completingAppointment: string | null = null;

  constructor() { }

  /**
   * Carga el perfil del usuario actual
   */
  private loadUserProfile(): void {
    this.loading = true;

    // Obtener el usuario actual del estado de autenticación
    this.authService.authState$.subscribe({
      next: (authState) => {
        if (authState.user?.id) {
          this.loadUserById(authState.user.id);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.notificationService.error('Error al obtener el estado de autenticación');
        this.loading = false;
        console.error('Error en authState:', error);
      }
    });
  }

  /**
   * Carga los datos de un usuario específico
   */
  private loadUserById(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        console.log('Usuario cargado exitosamente:', user);
        // Cargar las citas próximas después de cargar el usuario
        this.loadUpcomingAppointments();
        // Cargar el historial de citas después de cargar el usuario
        this.loadAppointmentHistory();
      },
      error: (error) => {
        this.notificationService.error(error.message || 'Error al cargar el perfil del usuario');
        this.loading = false;
        console.error('Error al cargar usuario:', error);
      }
    });
  }

  /**
   * Recarga el perfil del usuario
   */
  reloadProfile(): void {
    this.loadUserProfile();
    this.loadUpcomingAppointments();
  }

  /**
   * Obtiene la URL del avatar del usuario
   * Si no tiene imagen, genera un avatar usando el servicio centralizado
   */
  getAvatarUrl(): string {
    if (this.user?.profilePictureUrl) {
      return this.user.profilePictureUrl;
    }

    const fullName = this.getUserFullName();
    return fullName ? this.urlService.generateAvatarUrl(fullName, '570df8', 'fff', 96) : 'assets/images/default-avatar.png';
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  /**
   * Obtiene el rol del usuario formateado
   */
  getUserRole(): string {
    if (!this.user?.role) return '';

    switch (this.user.role) {
      case UserRole.ROLE_ADMIN:
        return 'Administrador';
      case UserRole.ROLE_BARBER:
        return 'Barbero';
      case UserRole.ROLE_CLIENT:
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }

  /**
   * Obtiene el color del badge según el rol
   */
  getRoleBadgeClass(): string {
    if (!this.user?.role) return 'badge-neutral';

    switch (this.user.role) {
      case UserRole.ROLE_ADMIN:
        return 'badge-error';
      case UserRole.ROLE_BARBER:
        return 'badge-warning';
      case UserRole.ROLE_CLIENT:
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  }

  /**
   * Verifica si el usuario actual es un barbero
   */
  isBarber(): boolean {
    return this.user?.role === UserRole.ROLE_BARBER;
  }

  isClientOrAdmin(): boolean {
    return this.user?.role === UserRole.ROLE_CLIENT || this.user?.role === UserRole.ROLE_ADMIN;
  }

  /**
   * Formatea la fecha de creación de la cuenta
   */
  getFormattedCreatedDate(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Navega a la página de edición de perfil
   */
  navigateToEditProfile(): void {
    this.router.navigate(['/user/edit-profile']);
  }

  /**
   * Navega a la página de cambio de contraseña
   */
  navigateToChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }

  /**
   * Navega a la página de reservar cita
   */
  navigateToBookAppointment(): void {
    this.router.navigate(['/book-appointment']);
  }

  loadUpcomingAppointments(): void {
    // Solo cargar citas si el usuario es cliente, administrador o barbero
    if (!this.isClientOrAdmin() && !this.isBarber()) {
      console.log('Usuario no autorizado para cargar citas próximas');
      return;
    }

    if (!this.user?.userId) {
      console.error('No user ID available for loading upcoming appointments');
      return;
    }

    this.loadingAppointments = true;

    // Usar endpoint específico según el rol del usuario
    const appointmentObservable = this.isBarber()
      ? this.appointmentService.getUpcomingAppointmentsByBarber(this.user.userId)
      : this.appointmentService.getUpcomingAppointmentsByClient(this.user.userId);

    appointmentObservable.subscribe({
      next: (response) => {
        // Manejar la respuesta paginada
        this.upcomingAppointments = response.data?.content || response.data || [];
        this.loadingAppointments = false;
        console.log('Próximas citas cargadas exitosamente:', this.upcomingAppointments);
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.notificationService.error('Error al cargar las próximas citas');
        this.upcomingAppointments = [];
        this.loadingAppointments = false;
      }
    });
  }



  /**
   * Cancela una cita con confirmación del usuario
   */
  cancelAppointment(appointmentId: string): void {
    // Solo permitir cancelación si el usuario es cliente, administrador o barbero
    if (!this.isClientOrAdmin() && !this.isBarber()) {
      console.log('Usuario no autorizado para cancelar citas');
      return;
    }

    // Mostrar confirmación antes de cancelar
    const confirmed = confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.');

    if (!confirmed) {
      return;
    }

    this.cancellingAppointment = appointmentId;

    this.appointmentService.cancelAppointment(appointmentId).subscribe({
      next: (response) => {
        this.notificationService.success('Cita cancelada exitosamente');
        // Recargar las citas para reflejar el cambio
        this.loadUpcomingAppointments();
        this.cancellingAppointment = null;
      },
      error: (error) => {
        console.error('Error al cancelar la cita:', error);
        this.notificationService.error('Error al cancelar la cita. Por favor, inténtalo de nuevo.');
        this.cancellingAppointment = null;
      }
    });
  }

  /**
   * Confirma una cita programada (solo para barberos)
   */
  confirmAppointment(appointmentId: string): void {
    // Solo permitir confirmación si el usuario es barbero o administrador
    if (!this.isBarber() && this.user?.role !== UserRole.ROLE_ADMIN) {
      console.log('Usuario no autorizado para confirmar citas');
      return;
    }

    // Mostrar confirmación antes de confirmar
    const confirmed = confirm('¿Estás seguro de que deseas confirmar esta cita?');

    if (!confirmed) {
      return;
    }

    this.confirmingAppointment = appointmentId;

    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: (response) => {
        this.notificationService.success('Cita confirmada exitosamente');
        // Recargar las citas para reflejar el cambio
        this.loadUpcomingAppointments();
        this.confirmingAppointment = null;
      },
      error: (error) => {
        console.error('Error al confirmar la cita:', error);
        this.notificationService.error('Error al confirmar la cita. Por favor, inténtalo de nuevo.');
        this.confirmingAppointment = null;
      }
    });
  }

  /**
   * Marca una cita como completada (solo para barberos)
   */
  completeAppointment(appointmentId: string): void {
    // Solo permitir completar si el usuario es barbero o administrador
    if (!this.isBarber() && this.user?.role !== UserRole.ROLE_ADMIN) {
      console.log('Usuario no autorizado para completar citas');
      return;
    }

    // Mostrar confirmación antes de completar
    const confirmed = confirm('¿Estás seguro de que deseas marcar esta cita como completada?');

    if (!confirmed) {
      return;
    }

    this.completingAppointment = appointmentId;

    this.appointmentService.completeAppointment(appointmentId).subscribe({
      next: (response) => {
        this.notificationService.success('Cita completada exitosamente');
        // Recargar las citas para reflejar el cambio
        this.loadUpcomingAppointments();
        this.completingAppointment = null;
      },
      error: (error) => {
        console.error('Error al completar la cita:', error);
        this.notificationService.error('Error al completar la cita. Por favor, inténtalo de nuevo.');
        this.completingAppointment = null;
      }
    });
  }

  // Historial de citas
  appointmentHistory: AppointmentResponse[] = [];
  isLoadingHistory = false;
  historyError: string | null = null;

  // Paginación del historial
  currentHistoryPage = 0;
  historyPageSize = 5;
  totalHistoryPages = 0;
  totalHistoryElements = 0;

  // Filtros del historial
  selectedStatusFilter: AppointmentStatus | 'ALL' = 'ALL';
  statusFilterOptions = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: AppointmentStatus.SCHEDULED, label: 'Programadas' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmadas' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'En progreso' },
    { value: AppointmentStatus.COMPLETED, label: 'Completadas' },
    { value: AppointmentStatus.CANCELLED, label: 'Canceladas' },
    { value: AppointmentStatus.NO_SHOW, label: 'No asistió' }
  ];

  /**
   * Carga el historial de citas del usuario con paginación y filtrado
   */
  loadAppointmentHistory(page: number = 0): void {
    // Solo cargar historial si el usuario es cliente, administrador o barbero
    if (!this.isClientOrAdmin() && !this.isBarber()) {
      console.log('Usuario no autorizado para cargar historial de citas');
      return;
    }

    if (!this.user?.userId) {
      console.error('❌ [ERROR] No hay userId disponible para cargar el historial');
      return;
    }

    console.log('🔍 [DEBUG] Configurando estado de carga...');
    this.isLoadingHistory = true;
    this.historyError = null;

    console.log('🔍 [DEBUG] Llamando al servicio de citas con parámetros:', {
      userId: this.user.userId,
      page: page,
      size: this.historyPageSize,
      sortBy: 'appointmentDateTime',
      sortDir: 'desc'
    });

    // Usar endpoint específico según el rol del usuario
    const appointmentObservable = this.isBarber()
      ? this.appointmentService.getAppointmentsByBarber(
          this.user.userId,
          page,
          this.historyPageSize,
          'appointmentDateTime',
          'desc'
        )
      : this.appointmentService.getAppointmentsByClient(
          this.user.userId,
          page,
          this.historyPageSize,
          'appointmentDateTime',
          'desc'
        );

    appointmentObservable.pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        console.log('🔍 [DEBUG] Finalizando petición, cambiando isLoadingHistory a false');
        this.isLoadingHistory = false;
      })
    ).subscribe({
      next: (response: any) => {
        console.log('✅ [SUCCESS] Respuesta recibida del servicio:', response);

        if (response && response.data) {
          const pageableData = response.data as PageableResponse<AppointmentResponse>;
          let appointments = pageableData.content || [];

          console.log('🔍 [DEBUG] Citas obtenidas antes del filtro:', appointments);
          console.log('🔍 [DEBUG] Filtro de estado seleccionado:', this.selectedStatusFilter);

          // Filtrar por estado si es necesario
          if (this.selectedStatusFilter !== 'ALL') {
            appointments = appointments.filter(
              appointment => appointment.status === this.selectedStatusFilter
            );
            console.log('🔍 [DEBUG] Citas después del filtro:', appointments);
          }

          this.appointmentHistory = appointments;
          this.currentHistoryPage = pageableData.pageable?.pageNumber || 0;
          this.totalHistoryPages = pageableData.totalPages || 0;
          this.totalHistoryElements = pageableData.totalElements || 0;
          this.historyError = null;

          console.log('🔍 [DEBUG] Estado final actualizado:', {
            appointmentHistory: this.appointmentHistory,
            currentHistoryPage: this.currentHistoryPage,
            totalHistoryPages: this.totalHistoryPages,
            totalHistoryElements: this.totalHistoryElements
          });
        } else {
          console.log('⚠️ [WARNING] Respuesta vacía del servicio');
          this.appointmentHistory = [];
          this.totalHistoryPages = 0;
          this.totalHistoryElements = 0;
        }
      },
      error: (error) => {
        console.error('❌ [ERROR] Error loading appointment history:', error);
        console.error('❌ [ERROR] Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });

        this.historyError = 'Error al cargar el historial de citas. Por favor, inténtalo de nuevo.';
        this.appointmentHistory = [];
        this.totalHistoryPages = 0;
        this.totalHistoryElements = 0;
      }
    });
  }

  /**
   * Cambia la página del historial
   */
  onHistoryPageChange(page: number): void {
    if (page >= 0 && page < this.totalHistoryPages) {
      this.loadAppointmentHistory(page);
    }
  }

  /**
   * Aplica filtro por estado
   */
  onStatusFilterChange(): void {
    this.currentHistoryPage = 0;
    this.loadAppointmentHistory(0);
  }

  /**
   * Obtiene el texto del estado de la cita
   */
  getStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'Completada';
      case AppointmentStatus.CANCELLED:
        return 'Cancelada';
      case AppointmentStatus.NO_SHOW:
        return 'No asistió';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada';
      case AppointmentStatus.SCHEDULED:
        return 'Programada';
      case AppointmentStatus.IN_PROGRESS:
        return 'En progreso';
      default:
        return status;
    }
  }

  /**
   * Obtiene la clase CSS para el badge del estado
   */
  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'badge-success';
      case AppointmentStatus.CANCELLED:
        return 'badge-error';
      case AppointmentStatus.NO_SHOW:
        return 'badge-warning';
      case AppointmentStatus.CONFIRMED:
        return 'badge-info';
      case AppointmentStatus.SCHEDULED:
        return 'badge-primary';
      case AppointmentStatus.IN_PROGRESS:
        return 'badge-accent';
      default:
        return 'badge-neutral';
    }
  }

  /**
   * Formatea la fecha de la cita
   */
  formatAppointmentDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea la hora de la cita
   */
  formatAppointmentTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    // Removemos la carga independiente del historial ya que ahora se carga después del usuario
    // this.loadAppointmentHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
