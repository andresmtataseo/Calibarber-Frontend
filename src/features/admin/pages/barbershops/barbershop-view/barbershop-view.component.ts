import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BarbershopResponse } from '../../../../barbershop/models/barbershop.model';
import { BarbershopService, BarbershopOperatingHoursService } from '../../../../barbershop/services';
import { BarbershopOperatingHours } from '../../../../barbershop/models/operating-hours.model';
import { NotificationService } from '../../../../../shared/components/notification';
import { PreloaderComponent } from '../../../../../shared/components/preloader';
import { finalize } from 'rxjs/operators';

interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  notes?: string;
}

@Component({
  selector: 'app-barbershop-view',
  standalone: true,
  imports: [
    CommonModule,
    PreloaderComponent
  ],
  templateUrl: './barbershop-view.component.html'
})
export class BarbershopViewComponent implements OnInit {
  barbershopId: string | null = null;
  barbershop: BarbershopResponse | null = null;
  operatingHours: BarbershopOperatingHours[] = [];
  displayOperatingHours: DaySchedule[] = [];
  loading = false;

  // Days of the week
  daysOfWeek = [
    { key: 'MONDAY', name: 'Lunes' },
    { key: 'TUESDAY', name: 'Martes' },
    { key: 'WEDNESDAY', name: 'Miércoles' },
    { key: 'THURSDAY', name: 'Jueves' },
    { key: 'FRIDAY', name: 'Viernes' },
    { key: 'SATURDAY', name: 'Sábado' },
    { key: 'SUNDAY', name: 'Domingo' }
  ];

  // Estados de carga y errores
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private barbershopService: BarbershopService,
    private operatingHoursService: BarbershopOperatingHoursService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.barbershopId = this.route.snapshot.paramMap.get('id');
    if (this.barbershopId) {
      this.loadBarbershopData();
    } else {
      this.notificationService.error('ID de barbería no válido');
    }
  }

  private loadBarbershopData(): void {
    if (!this.barbershopId) return;

    this.isLoading = true;

    // Cargar datos de la barbería
    this.barbershopService.getBarbershopById(this.barbershopId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (barbershop) => {
          console.log('Barbería cargada exitosamente:', barbershop);
          this.barbershop = barbershop;
          this.loadOperatingHours();
        },
        error: (error) => {
          console.error('Error al cargar la barbería:', error);
          this.notificationService.error(error.message || 'Error al cargar la barbería');
        }
      });
  }

  private loadOperatingHours(): void {
    if (!this.barbershopId) return;

    this.operatingHoursService.getOperatingHoursByBarbershopId(this.barbershopId)
      .subscribe({
        next: (operatingHours) => {
          console.log('Horarios cargados exitosamente:', operatingHours);
          this.processOperatingHours(operatingHours);
        },
        error: (error) => {
          console.error('Error al cargar los horarios:', error);
          // Si no hay horarios, mostrar horarios por defecto
          this.processOperatingHours([]);
        }
      });
  }

  private processOperatingHours(operatingHours: BarbershopOperatingHours[] = []): void {
    // Create a map of existing operating hours by day of week
    const existingHours = new Map();
    operatingHours.forEach(hour => {
      const dayKey = hour.dayOfWeek; // Ya es el enum string
      existingHours.set(dayKey, hour);
    });

    // Process each day of the week
    this.displayOperatingHours = this.daysOfWeek.map(day => {
      const existingHour = existingHours.get(day.key);
      
      if (existingHour) {
        return {
          dayName: day.name,
          isOpen: !existingHour.isClosed,
          openTime: existingHour.openingTime || '09:00',
          closeTime: existingHour.closingTime || '18:00',
          notes: existingHour.notes || undefined
        };
      } else {
        // Default values for days without specific hours
        return {
          dayName: day.name,
          isOpen: true,
          openTime: '09:00',
          closeTime: '18:00'
        };
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/admin/barbershops']);
  }

  onEdit(): void {
    if (this.barbershopId) {
      this.router.navigate(['/admin/barbershops/edit', this.barbershopId]);
    }
  }

  retryLoad(): void {
    this.loadBarbershopData();
  }

  getDayName(dayKey: string): string {
    const day = this.daysOfWeek.find(d => d.key === dayKey);
    return day ? day.name : '';
  }
}