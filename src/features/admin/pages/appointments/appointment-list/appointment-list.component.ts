import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../appointment/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../../appointment/models/appointment.model';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

        // Mostrar notificaciones según los resultados
        if (this.appointments.length === 0) {
          if (this.searchTerm || this.statusFilter) {
            this.notificationService.warning('No se encontraron citas que coincidan con los filtros aplicados');
          } else {
            this.notificationService.warning('No hay citas disponibles en el sistema');
          }
        } else {
          const message = this.searchTerm || this.statusFilter
            ? `Se encontraron ${this.appointments.length} citas que coinciden con los filtros`
            : `Se cargaron ${this.appointments.length} citas correctamente`;
          this.notificationService.success(message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.error(this.getErrorMessage(error, 'carga de citas'));
        this.loading = false;
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
    if (!appointment || !appointment.appointmentId) {
      this.notificationService.warning('No se puede cancelar la cita. Información no disponible.');
      return;
    }

    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const confirmMessage = `¿Estás seguro de que deseas cancelar la cita de "${clientName}" programada para el ${formattedDate}?\n\nEsta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
      this.appointmentService.cancelAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success(`La cita de "${clientName}" ha sido cancelada exitosamente`);
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error, 'cancelación de cita'));
        }
      });
    }
  }

  confirmAppointmentAction(appointment: AppointmentResponse): void {
    if (!appointment || !appointment.appointmentId) {
      this.notificationService.warning('No se puede confirmar la cita. Información no disponible.');
      return;
    }

    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const confirmMessage = `¿Estás seguro de que deseas confirmar la cita de "${clientName}" programada para el ${formattedDate}?`;

    if (confirm(confirmMessage)) {
      this.appointmentService.confirmAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success(`La cita de "${clientName}" ha sido confirmada exitosamente`);
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error, 'confirmación de cita'));
        }
      });
    }
  }

  completeAppointmentAction(appointment: AppointmentResponse): void {
    if (!appointment || !appointment.appointmentId) {
      this.notificationService.warning('No se puede completar la cita. Información no disponible.');
      return;
    }

    const clientName = `${appointment.user.firstName} ${appointment.user.lastName}`;
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString() + ' ' + appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const confirmMessage = `¿Estás seguro de que deseas marcar como completada la cita de "${clientName}" programada para el ${formattedDate}?`;

    if (confirm(confirmMessage)) {
      this.appointmentService.completeAppointment(appointment.appointmentId).subscribe({
        next: () => {
          this.notificationService.success(`La cita de "${clientName}" ha sido marcada como completada exitosamente`);
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error, 'completar cita'));
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

  private getErrorMessage(error: HttpErrorResponse, context: string = 'operación'): string {
    if (error.error?.message) {
      return `Error en ${context}: ${error.error.message}`;
    }

    switch (error.status) {
      case 0:
        return `Error de conexión durante la ${context}. Verifica tu conexión a internet y que el servidor esté ejecutándose.`;
      case 400:
        return `Solicitud inválida durante la ${context}. Verifique los datos enviados.`;
      case 401:
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          return `No autorizado para realizar la ${context}. Por favor, inicia sesión.`;
        }
        return `Tu sesión ha expirado durante la ${context}. Por favor, inicia sesión nuevamente.`;
      case 403:
        const user = this.authService.getCurrentUser();
        if (user && user.role !== 'ROLE_ADMIN') {
          return `Acceso denegado para la ${context}. Solo los administradores pueden realizar esta acción.`;
        }
        return `No tienes permisos suficientes para realizar la ${context}.`;
      case 404:
        return `El recurso solicitado no fue encontrado durante la ${context}.`;
      case 409:
        return `Conflicto detectado durante la ${context}. El recurso ya existe o está en uso.`;
      case 422:
        return `Los datos proporcionados no son válidos para la ${context}.`;
      case 500:
        return `Error interno del servidor durante la ${context}. Inténtalo más tarde.`;
      case 502:
        return `Error de conexión con el servidor durante la ${context}.`;
      case 503:
        return `Servicio no disponible temporalmente durante la ${context}.`;
      default:
        if (error.status >= 500) {
          return `Error interno del servidor durante la ${context}. Inténtalo más tarde.`;
        }
        return `Error inesperado durante la ${context}. Código: ${error.status}`;
    }
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
