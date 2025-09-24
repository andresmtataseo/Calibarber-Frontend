import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { UserService } from '../../../../user/services/user.service';
import { UserResponse, UserRole } from '../../../../user/models/user.model';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PreloaderComponent],
  templateUrl: './user-view.component.html'
})
export class UserViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  // Data properties
  user: UserResponse | null = null;

  // State properties
  loading = true;
  error: string | null = null;
  userId: string;

  // Role options for display
  private roles = [
    { value: UserRole.ROLE_ADMIN, label: 'Administrador' },
    { value: UserRole.ROLE_CLIENT, label: 'Cliente' },
    { value: UserRole.ROLE_BARBER, label: 'Barbero' }
  ];

  constructor() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserData();
    } else {
      const errorMessage = 'ID de usuario no válido o no proporcionado';
      this.notificationService.error(errorMessage, 5000);
      this.error = errorMessage;
      this.loading = false;
    }
  }

  private loadUserData(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.notificationService.success(`Información de ${this.getFullName()} cargada exitosamente`, 3000);
      },
      error: (error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error, 'cargar la información del usuario');
        this.notificationService.error(errorMessage, 6000);
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }

  // Helper methods for display
  getFullName(): string {
    if (!this.user) return 'Sin información';
    return `${this.user.firstName} ${this.user.lastName}`.trim() || 'Sin información';
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue || 'Sin información';
  }

  getStatusLabel(statusValue: boolean): string {
    return statusValue ? 'Activo' : 'Inactivo';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Sin información';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }

      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  editUser(): void {
    if (this.user) {
      this.router.navigate(['/admin/users/edit', this.user.userId]);
    }
  }

  deleteUser(): void {
    if (!this.user) {
      this.notificationService.warning('No se puede eliminar: información de usuario no disponible', 4000);
      return;
    }

    const userName = this.getFullName();
    const confirmMessage = `¿Estás seguro de que deseas eliminar a ${userName}? Esta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      this.loading = true;
      
      this.userService.deleteUser(this.user.userId).subscribe({
        next: () => {
          this.notificationService.success(`Usuario ${userName} eliminado exitosamente`, 4000);
          this.router.navigate(['/admin/users']);
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = this.getErrorMessage(error, `eliminar el usuario ${userName}`);
          this.notificationService.error(errorMessage, 6000);
          this.loading = false;
        }
      });
    }
  }

  toggleStatus(): void {
    if (!this.user) {
      this.notificationService.warning('No se puede cambiar el estado: información de usuario no disponible', 4000);
      return;
    }

    const currentStatus = this.user.isActive;
    const newStatus = !currentStatus;
    const userName = this.getFullName();
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (confirm(`¿Deseas ${action} a ${userName}?`)) {
      this.notificationService.warning(
        `La funcionalidad para ${action} usuarios requiere implementación adicional en el servicio. Por favor, contacta al administrador del sistema.`, 
        8000
      );
    }
  }

  /**
   * Obtiene un mensaje de error más descriptivo basado en el HttpErrorResponse
   */
  private getErrorMessage(error: HttpErrorResponse, action: string): string {
    if (error.error?.message) {
      return `Error al ${action}: ${error.error.message}`;
    }
    
    switch (error.status) {
      case 0:
        return `No se pudo ${action}. Verifica tu conexión a internet y vuelve a intentarlo.`;
      case 400:
        return `Error al ${action}: Los datos enviados no son válidos.`;
      case 401:
        return `Error al ${action}: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.`;
      case 403:
        return `Error al ${action}: No tienes permisos suficientes para realizar esta acción.`;
      case 404:
        return `Error al ${action}: El usuario solicitado no fue encontrado. Es posible que haya sido eliminado.`;
      case 409:
        return `Error al ${action}: Conflicto con los datos existentes. Verifica la información e intenta nuevamente.`;
      case 422:
        return `Error al ${action}: Los datos proporcionados no son válidos o están incompletos.`;
      case 500:
        return `Error interno del servidor al ${action}. Por favor, intenta nuevamente en unos minutos.`;
      case 502:
      case 503:
      case 504:
        return `El servicio no está disponible temporalmente. Por favor, intenta ${action} más tarde.`;
      default:
        return `Error inesperado al ${action}. Código de error: ${error.status}. Por favor, contacta al administrador si el problema persiste.`;
    }
  }
}