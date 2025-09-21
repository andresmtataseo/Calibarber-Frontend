import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../appointment/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../../appointment/models/appointment.model';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PreloaderComponent],
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  loading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Sorting
  sortBy = 'appointmentDatetimeStart';
  sortDir = 'desc';

  // Filters
  statusFilter: AppointmentStatus | null = null;

  private readonly router = inject(Router);
  private readonly appointmentService = inject(AppointmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    // Verificar si el usuario tiene permisos de administrador
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.error('Debes iniciar sesión para acceder a las citas.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (currentUser.role !== 'ROLE_ADMIN') {
      this.notificationService.error('Solo los administradores pueden acceder a esta sección.');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAppointments();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    this.loading = true;

    this.appointmentService.getAllAppointments(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir,
      this.searchTerm,
      this.statusFilter
    ).subscribe({
      next: (response) => {
        if (response.data) {
          this.appointments = response.data.content || [];
          this.totalElements = response.data.totalElements || 0;
          this.totalPages = response.data.totalPages || 0;
        } else {
          this.appointments = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.error(this.getErrorMessage(error));
        this.loading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAppointments();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page
    this.loadAppointments();
  }

  onSort(field: string): void {
    this.sortBy = field;
    this.loadAppointments();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadAppointments();
  }

  onStatusFilterChange(status: AppointmentStatus | null): void {
    this.statusFilter = status;
    this.currentPage = 0;
    this.loadAppointments();
  }

  viewAppointment(id: string): void {
    this.router.navigate(['/admin/appointments/view', id]);
  }

  editAppointment(id: string): void {
    this.router.navigate(['/admin/appointments/edit', id]);
  }

  cancelAppointment(appointment: AppointmentResponse): void {
    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (confirm(`¿Estás seguro de que deseas cancelar la cita de "${clientName}" programada para el ${formattedDate}?`)) {
      this.appointmentService.cancelAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success('Cita cancelada exitosamente');
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error));
          console.error('Error cancelling appointment:', error);
        }
      });
    }
  }

  confirmAppointmentAction(appointment: AppointmentResponse): void {
    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (confirm(`¿Estás seguro de que deseas confirmar la cita de "${clientName}" programada para el ${formattedDate}?`)) {
      this.appointmentService.confirmAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success('Cita confirmada exitosamente');
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error));
          console.error('Error confirming appointment:', error);
        }
      });
    }
  }

  completeAppointmentAction(appointment: AppointmentResponse): void {
    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (confirm(`¿Estás seguro de que deseas marcar como completada la cita de "${clientName}" programada para el ${formattedDate}?`)) {
      this.appointmentService.completeAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success('Cita completada exitosamente');
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error));
          console.error('Error completing appointment:', error);
        }
      });
    }
  }

  createAppointment(): void {
    this.router.navigate(['/admin/appointments/create']);
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 0) {
      return 'Error de conexión. Verifica tu conexión a internet y que el servidor esté ejecutándose.';
    }
    if (error.status === 401) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        return 'No autorizado. Por favor, inicia sesión para acceder a las citas.';
      }
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    if (error.status === 403) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.role !== 'ROLE_ADMIN') {
        return 'Acceso denegado. Solo los administradores pueden ver todas las citas del sistema.';
      }
      return 'No tienes permisos para acceder a esta información.';
    }
    if (error.status >= 500) {
      return 'Error interno del servidor. Inténtalo más tarde.';
    }
    return 'Ha ocurrido un error inesperado al cargar las citas.';
  }

  // Método auxiliar para usar Math.min en el template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Método para obtener la clase CSS del estado
  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'badge-info';
      case AppointmentStatus.CONFIRMED:
        return 'badge-primary';
      case AppointmentStatus.IN_PROGRESS:
        return 'badge-warning';
      case AppointmentStatus.COMPLETED:
        return 'badge-success';
      case AppointmentStatus.CANCELLED:
        return 'badge-error';
      case AppointmentStatus.NO_SHOW:
        return 'badge-ghost';
      default:
        return 'badge-neutral';
    }
  }

  // Método para obtener el texto del estado en español
  getStatusText(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'Programada';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada';
      case AppointmentStatus.IN_PROGRESS:
        return 'En progreso';
      case AppointmentStatus.COMPLETED:
        return 'Completada';
      case AppointmentStatus.CANCELLED:
        return 'Cancelada';
      case AppointmentStatus.NO_SHOW:
        return 'No asistió';
      default:
        return 'Desconocido';
    }
  }
}
