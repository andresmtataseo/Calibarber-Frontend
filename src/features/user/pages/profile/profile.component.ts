import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PreloaderComponent } from '../../../../shared/components/preloader/preloader.component';
import { UserResponse, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UrlService } from '../../../../core/services/url.service';
import { NotificationService } from '../../../../shared/components/notification/notification.service';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { AppointmentResponse } from '../../../appointment/models/appointment.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PreloaderComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly urlService = inject(UrlService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly appointmentService = inject(AppointmentService);

  user: UserResponse | null = null;
  loading = false;
  upcomingAppointments: AppointmentResponse[] = [];
  loadingAppointments = false;
  cancellingAppointment: string | null = null;

  constructor() { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

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
          this.notificationService.error('No se pudo obtener la información del usuario autenticado');
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
    this.router.navigate(['/change-password']);
  }

  /**
   * Navega a la página de reservar cita
   */
  navigateToBookAppointment(): void {
    this.router.navigate(['/book-appointment']);
  }

  loadUpcomingAppointments(): void {
    if (!this.user?.userId) {
      return;
    }

    this.loadingAppointments = true;
    this.appointmentService.getUpcomingAppointmentsByClient(this.user.userId).subscribe({
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

  formatAppointmentDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatAppointmentTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'SCHEDULED': 'Programada',
      'CONFIRMED': 'Confirmada',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'NO_SHOW': 'No se presentó'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'badge-info';
      case 'CONFIRMED': return 'badge-success';
      case 'COMPLETED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'CANCELLED': return 'badge-error';
      case 'NO_SHOW': return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  /**
   * Cancela una cita con confirmación del usuario
   */
  cancelAppointment(appointmentId: string): void {
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
}
