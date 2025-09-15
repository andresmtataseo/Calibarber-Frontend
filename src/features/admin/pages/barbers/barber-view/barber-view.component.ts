import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BarberService } from '../../../../barber/services';
import { BarbershopService } from '../../../../barbershop/services';
import { UserService } from '../../../../user/services';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { BarberResponse, BarberAvailabilityResponse } from '../../../../barber/models';
import { BarbershopResponse } from '../../../../barbershop/models';
import { UserResponse } from '../../../../user/models';

interface DayAvailability {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

interface BarberStatistics {
  completedAppointments: number;
  pendingAppointments: number;
  averageRating: number;
}

@Component({
  selector: 'app-barber-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PreloaderComponent],
  templateUrl: './barber-view.component.html'
})
export class BarberViewComponent implements OnInit {
  // Data properties
  barber: BarberResponse | null = null;
  user: UserResponse | null = null;
  barbershop: BarbershopResponse | null = null;
  barberAvailability: BarberAvailabilityResponse[] = [];
  statistics: BarberStatistics = {
    completedAppointments: 0,
    pendingAppointments: 0,
    averageRating: 0
  };

  // State properties
  loading = true;
  error: string | null = null;
  barberId: string;

  // Days of the week for schedule display
  private daysOfWeek = [
    { key: 'MONDAY', name: 'Lunes' },
    { key: 'TUESDAY', name: 'Martes' },
    { key: 'WEDNESDAY', name: 'Miércoles' },
    { key: 'THURSDAY', name: 'Jueves' },
    { key: 'FRIDAY', name: 'Viernes' },
    { key: 'SATURDAY', name: 'Sábado' },
    { key: 'SUNDAY', name: 'Domingo' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberService: BarberService,
    private barbershopService: BarbershopService,
    private userService: UserService
  ) {
    this.barberId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.barberId) {
      this.loadBarberData();
    } else {
      this.error = 'ID de barbero no válido';
      this.loading = false;
    }
  }

  private async loadBarberData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load barber data
      this.barber = await this.getBarberById(this.barberId);

      if (this.barber) {
        // Load related data in parallel
        await Promise.all([
          this.loadUserData(this.barber.userId),
          this.loadBarbershopData(this.barber.barbershopId),
          this.loadStatistics(this.barberId),
          this.loadBarberAvailability(this.barberId)
        ]);
      } else {
        this.error = 'Barbero no encontrado';
      }
    } catch (error) {
      console.error('Error loading barber data:', error);
      this.error = 'Error al cargar los datos del barbero';
    } finally {
      this.loading = false;
    }
  }

  private getBarberById(barberId: string): Promise<BarberResponse | null> {
    return new Promise((resolve, reject) => {
      this.barberService.getBarberById(barberId).subscribe({
        next: (barber) => resolve(barber),
        error: (error) => {
          console.error('Error fetching barber:', error);
          resolve(null);
        }
      });
    });
  }

  private loadUserData(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.user = user;
          resolve();
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          resolve(); // Don't fail the entire load for user data
        }
      });
    });
  }

  private loadBarbershopData(barbershopId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.barbershopService.getBarbershopById(barbershopId).subscribe({
        next: (barbershop) => {
          this.barbershop = barbershop;
          resolve();
        },
        error: (error) => {
          console.error('Error loading barbershop data:', error);
          resolve(); // Don't fail the entire load for barbershop data
        }
      });
    });
  }

  private loadStatistics(barberId: string): Promise<void> {
    return new Promise((resolve) => {
      // Simulate loading statistics - replace with actual service call
      setTimeout(() => {
        this.statistics = {
          completedAppointments: Math.floor(Math.random() * 100) + 20,
          pendingAppointments: Math.floor(Math.random() * 10) + 1,
          averageRating: Number((Math.random() * 2 + 3).toFixed(1)) // 3.0 to 5.0
        };
        resolve();
      }, 500);
    });
  }

  private async loadBarberAvailability(barberId: string): Promise<void> {
    try {
      const response = await this.barberService.getBarberAvailability(barberId).toPromise();
      this.barberAvailability = response?.data || [];
    } catch (error) {
      console.error('Error loading barber availability:', error);
      this.barberAvailability = [];
    }
  }

  // Helper methods for template
  getBarberName(): string {
    if (!this.user) return 'Nombre no disponible';
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || 'Nombre no disponible';
  }

  getBarberEmail(): string {
    return this.user?.email || 'Email no disponible';
  }

  getBarberPhone(): string {
    return this.user?.phoneNumber || '';
  }

  getBarberInitials(): string {
    if (!this.user) return '??';

    const firstInitial = this.user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = this.user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || '??';
  }

  getBarbershopName(): string {
    return this.barbershop?.name || 'Barbería no disponible';
  }

  getBarberUserId(): string {
    return this.barber?.userId || '';
  }

  getBarberBarbershopId(): string {
    return this.barber?.barbershopId || '';
  }

  getDayStartTime(dayKey: string): string {
    const availability = this.barberAvailability.find(a => a.dayOfWeek.toLowerCase() === dayKey.toLowerCase());
    return availability?.startTime || '';
  }

  getDayEndTime(dayKey: string): string {
    const availability = this.barberAvailability.find(a => a.dayOfWeek.toLowerCase() === dayKey.toLowerCase());
    return availability?.endTime || '';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Fecha no disponible';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  // Schedule methods
  getDaysOfWeek() {
    return this.daysOfWeek;
  }

  isDayAvailable(dayKey: string): boolean {
    const dayAvailability = this.barberAvailability.find(av =>
      av.dayOfWeek.toLowerCase() === dayKey.toLowerCase()
    );
    return dayAvailability?.isAvailable || false;
  }

  getDaySchedule(dayKey: string): string {
    const dayAvailability = this.barberAvailability.find(av =>
      av.dayOfWeek.toLowerCase() === dayKey.toLowerCase()
    );

    if (!dayAvailability?.isAvailable) {
      return 'No disponible';
    }

    const startTime = dayAvailability.startTime || '09:00';
    const endTime = dayAvailability.endTime || '18:00';

    return `${startTime} - ${endTime}`;
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/admin/barbers']);
  }

  editBarber(): void {
    this.router.navigate(['/admin/barbers', this.barberId, 'edit']);
  }

  deleteBarber(): void {
    const barberName = this.getBarberName();

    if (confirm(`¿Estás seguro de que deseas eliminar a ${barberName}? Esta acción no se puede deshacer.`)) {
      this.barberService.deleteBarber(this.barberId).subscribe({
        next: () => {
          console.log('Barber deleted successfully');
          this.router.navigate(['/admin/barbers']);
        },
        error: (error) => {
          console.error('Error deleting barber:', error);
          alert('Error al eliminar el barbero. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

  toggleStatus(): void {
    if (!this.barber) return;

    const newStatus = !this.barber.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    const barberName = this.getBarberName();

    if (confirm(`¿Estás seguro de que deseas ${action} a ${barberName}?`)) {
      const updatedBarber = { ...this.barber, isActive: newStatus };

      this.barberService.updateBarber(this.barberId, updatedBarber).subscribe({
        next: (updated) => {
          this.barber = updated;
          console.log(`Barber status updated to ${newStatus}`);
        },
        error: (error) => {
          console.error('Error updating barber status:', error);
          alert(`Error al ${action} el barbero. Por favor, inténtalo de nuevo.`);
        }
      });
    }
  }

  // Quick action methods
  viewAppointments(): void {
    // Navigate to appointments filtered by this barber
    this.router.navigate(['/admin/appointments'], {
      queryParams: { barberId: this.barberId }
    });
  }

  viewReviews(): void {
    // Navigate to reviews filtered by this barber
    this.router.navigate(['/admin/reviews'], {
      queryParams: { barberId: this.barberId }
    });
  }
}
