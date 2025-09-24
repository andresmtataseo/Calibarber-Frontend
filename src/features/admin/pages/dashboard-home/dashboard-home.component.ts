import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// Importar los servicios necesarios
import { UserService } from '../../../user/services/user.service';
import { BarberService } from '../../../barber/services/barber.service';
import { AppointmentService } from '../../../appointment/services/appointment.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Propiedades para almacenar los datos del dashboard
  totalUsers: number = 0;
  totalBarbers: number = 0;
  todayAppointments: number = 0;

  // Estados de carga y error
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private barberService: BarberService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga todos los datos del dashboard de forma paralela
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Ejecutar todas las consultas en paralelo
    forkJoin({
      users: this.userService.getTotalActiveUsers(),
      barbers: this.barberService.getTotalActiveBarbers(),
      appointments: this.appointmentService.getTodayAppointmentsCount()
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.totalUsers = data.users;
        this.totalBarbers = data.barbers;
        this.todayAppointments = data.appointments;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.hasError = true;
        this.errorMessage = 'Error al cargar los datos del dashboard. Por favor, intenta nuevamente.';

        // Valores por defecto en caso de error
        this.totalUsers = 0;
        this.totalBarbers = 0;
        this.todayAppointments = 0;
      }
    });
  }

  /**
   * Reintenta cargar los datos del dashboard
   */
  retryLoadData(): void {
    this.loadDashboardData();
  }

  /**
   * Navega a la ruta especificada
   * @param route - Ruta a la que navegar
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
