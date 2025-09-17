import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../appointment/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../../appointment/models/appointment.model';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-appointment-view',
  standalone: true,
  imports: [CommonModule, PreloaderComponent],
  templateUrl: './appointment-view.component.html'
})
export class AppointmentViewComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  appointment: AppointmentResponse | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAppointment(id);
    } else {
      this.error = 'ID de cita no válido';
    }
  }

  private loadAppointment(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointment:', error);
        this.error = 'Error al cargar la cita';
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    if (this.appointment) {
      this.router.navigate(['/admin/appointments/edit', this.appointment.appointmentId]);
    }
  }

  onBack(): void {
    this.router.navigate(['/admin/appointments']);
  }

  getStatusClass(status: AppointmentStatus): string {
    if (!status) return 'badge-neutral';
    
    switch (status) {
      case 'CONFIRMED':
        return 'badge-success';
      case 'SCHEDULED':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-error';
      case 'COMPLETED':
        return 'badge-info';
      case 'IN_PROGRESS':
        return 'badge-primary';
      case 'NO_SHOW':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  }

  getStatusText(status: AppointmentStatus): string {
    if (!status) return 'Sin estado';
    
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'SCHEDULED':
        return 'Programada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'NO_SHOW':
        return 'No Asistió';
      default:
        return 'Sin estado';
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return 'No especificada';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    if (!time) return 'No especificada';
    return time;
  }
}
