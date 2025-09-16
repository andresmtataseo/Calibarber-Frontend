// Remove the UserResponse interface as we're now using the User model
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { UserService } from '../../../../user/services/user.service';
import { UserResponse, UserRole } from '../../../../user/models/user.model';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PreloaderComponent],
  templateUrl: './user-view.component.html'
})
export class UserViewComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserData();
    } else {
      this.error = 'ID de usuario no válido';
      this.loading = false;
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      this.userService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (error: Error) => {
          console.error('Error loading user data:', error);
          this.error = error.message || 'Error al cargar la información del usuario';
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      this.error = 'Error al cargar la información del usuario';
      this.loading = false;
    }
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
    } catch (error) {
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
    if (this.user && confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(this.user.userId).subscribe({
        next: () => {
          console.log('Usuario eliminado exitosamente');
          this.router.navigate(['/admin/users']);
        },
        error: (error: Error) => {
          console.error('Error deleting user:', error);
          this.error = error.message || 'Error al eliminar el usuario';
        }
      });
    }
  }

  toggleStatus(): void {
    if (this.user) {
      const currentStatus = this.user.isActive;
      const newStatus = !currentStatus;
      
      if (confirm(`¿Deseas ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) {
        // Note: This would require a toggleUserStatus method in UserService
        // For now, we'll just show a message that this feature needs implementation
        console.log('Toggle status functionality needs to be implemented in UserService');
        alert('Esta funcionalidad requiere implementación adicional en el servicio');
      }
    }
  }
}