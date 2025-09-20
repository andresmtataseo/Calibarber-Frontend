import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrlService } from '../../../core/services/url.service';
import { RouterModule } from '@angular/router';
import { BarbershopService, BarbershopOperatingHoursService } from '../../../features/barbershop/services';
import { BarbershopResponse } from '../../../features/barbershop/models/barbershop.model';
import { BarbershopOperatingHours } from '../../../features/barbershop/models/operating-hours.model';
import { Subject, takeUntil, finalize } from 'rxjs';

interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  notes?: string;
}

/**
 * Componente Footer reutilizable
 *
 * Este componente implementa el pie de página de la aplicación
 * siguiendo el diseño de DaisyUI. Incluye:
 * - Información de la empresa CaliBarber (datos reales desde la API)
 * - Información de contacto y ubicación
 * - Horarios de atención (datos reales desde la API)
 * - Enlaces a políticas y términos legales
 * - Diseño responsive con Daisy UI y Tailwind CSS
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  private urlService = inject(UrlService);
  private barbershopService = inject(BarbershopService);
  private operatingHoursService = inject(BarbershopOperatingHoursService);
  private destroy$ = new Subject<void>();

  /**
   * Año actual para el copyright
   */
  currentYear = new Date().getFullYear();

  /**
   * Datos de la barbería (se cargarán desde la API)
   */
  barbershop: BarbershopResponse | null = null;
  operatingHours: BarbershopOperatingHours[] = [];
  displayOperatingHours: DaySchedule[] = [];
  isLoading = false;

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

  /**
   * Información de contacto de la empresa (fallback si no hay datos de la API)
   */
  contactInfo = {
    name: 'No disponible',
    address: 'Dirección no disponible',
    phone: 'Teléfono no disponible',
    email: 'Email no disponible'
  };

  /**
   * Horarios de atención (fallback si no hay datos de la API)
   */
  scheduleInfo = {
    weekdays: 'Horarios no disponibles',
    saturday: 'Horarios no disponibles',
    sunday: 'Horarios no disponibles'
  };

  /**
   * Enlaces de servicios
   */
  serviceLinks = [
    { label: 'Cortes de cabello', route: '/servicios/cortes' },
    { label: 'Afeitado', route: '/servicios/afeitado' },
    { label: 'Barba y bigote', route: '/servicios/barba' },
    { label: 'Tratamientos', route: '/servicios/tratamientos' }
  ];

  /**
   * Enlaces de la empresa
   */
  companyLinks = [
    { label: 'Nosotros', route: '/nosotros' },
    { label: 'Equipo', route: '/equipo' },
    { label: 'Galería', route: '/galeria' },
    { label: 'Contacto', route: '/contacto' }
  ];

  /**
   * Enlaces legales
   */
  legalLinks = [
    { label: 'Términos y condiciones', route: '/terminos' },
    { label: 'Política de privacidad', route: '/privacidad' },
    { label: 'Política de reembolso', route: '/reembolso' },
    { label: 'FAQ', route: '/faq' }
  ];

  ngOnInit(): void {
    this.loadBarbershopData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de la barbería desde la API
   */
  private loadBarbershopData(): void {
    this.isLoading = true;

    // Obtener todas las barberías y tomar la primera
    this.barbershopService.getAllBarbershops()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.data?.content && response.data.content.length > 0) {
            this.barbershop = response.data.content[0]; // Tomar la primera barbería
            this.updateContactInfo();
            this.loadOperatingHours();
          }
        },
        error: (error) => {
          console.error('Error al cargar datos de la barbería:', error);
          // Mantener los datos por defecto en caso de error
        }
      });
  }

  /**
   * Actualiza la información de contacto con los datos reales de la barbería
   */
  private updateContactInfo(): void {
    if (this.barbershop) {
      this.contactInfo = {
        name: this.barbershop.name || 'Nombre no disponible',
        address: this.barbershop.addressText || 'Dirección no disponible',
        phone: this.barbershop.phoneNumber || 'Teléfono no disponible',
        email: this.barbershop.email || 'Email no disponible'
      };
    }
  }

  /**
   * Carga los horarios de operación de la barbería
   */
  private loadOperatingHours(): void {
    if (!this.barbershop?.barbershopId) return;

    this.operatingHoursService.getOperatingHoursByBarbershopId(this.barbershop.barbershopId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (operatingHours) => {
          this.processOperatingHours(operatingHours);
        },
        error: (error) => {
          console.error('Error al cargar los horarios:', error);
          // Mantener horarios por defecto en caso de error
          this.processOperatingHours([]);
        }
      });
  }

  /**
   * Procesa los horarios de operación para mostrarlos en el footer
   */
  private processOperatingHours(operatingHours: BarbershopOperatingHours[] = []): void {
    // Create a map of existing operating hours by day of week
    const existingHours = new Map();
    operatingHours.forEach(hour => {
      const dayKey = hour.dayOfWeek;
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
          isOpen: false,
          openTime: 'No disponible',
          closeTime: 'No disponible'
        };
      }
    });

    // Actualizar scheduleInfo con los horarios reales
    this.updateScheduleInfo();
  }

  /**
   * Actualiza la información de horarios para mostrar en el template
   */
  private updateScheduleInfo(): void {
    if (this.displayOperatingHours.length === 0) return;

    // Agrupar días por horarios similares
    const weekdayHours = this.displayOperatingHours.slice(0, 5); // Lunes a Viernes
    const saturdayHours = this.displayOperatingHours[5]; // Sábado
    const sundayHours = this.displayOperatingHours[6]; // Domingo

    // Verificar si todos los días de semana tienen el mismo horario
    const firstWeekdayHour = weekdayHours[0];
    const sameWeekdayHours = weekdayHours.every(day => 
      day.isOpen === firstWeekdayHour.isOpen && 
      day.openTime === firstWeekdayHour.openTime && 
      day.closeTime === firstWeekdayHour.closeTime
    );

    if (sameWeekdayHours && firstWeekdayHour.isOpen) {
      this.scheduleInfo.weekdays = `Lunes a Viernes: ${this.formatTime(firstWeekdayHour.openTime)} - ${this.formatTime(firstWeekdayHour.closeTime)}`;
    } else if (sameWeekdayHours && !firstWeekdayHour.isOpen) {
      this.scheduleInfo.weekdays = 'Lunes a Viernes: Cerrado';
    } else {
      this.scheduleInfo.weekdays = 'Lunes a Viernes: Horarios no disponibles';
    }

    // Sábado
    if (saturdayHours.isOpen) {
      this.scheduleInfo.saturday = `Sábados: ${this.formatTime(saturdayHours.openTime)} - ${this.formatTime(saturdayHours.closeTime)}`;
    } else {
      this.scheduleInfo.saturday = 'Sábados: Horarios no disponibles';
    }

    // Domingo
    if (sundayHours.isOpen) {
      this.scheduleInfo.sunday = `Domingos: ${this.formatTime(sundayHours.openTime)} - ${this.formatTime(sundayHours.closeTime)}`;
    } else {
      this.scheduleInfo.sunday = 'Domingos: Horarios no disponibles';
    }
  }

  /**
   * Formatea la hora de 24h a 12h con AM/PM
   */
  private formatTime(time: string): string {
    if (!time || time === 'No disponible') return 'No disponible';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  }

  /**
   * Maneja el click en los enlaces del footer
   */
  onLinkClick(route: string): void {
    // La navegación se maneja automáticamente por RouterModule
    console.log(`Navegando a: ${route}`);
  }

  /**
   * Maneja el click en redes sociales
   */
  onSocialClick(platform: string): void {
    switch (platform) {
      case 'instagram':
        window.open(this.urlService.getSocialMediaUrl('INSTAGRAM'), '_blank');
        break;
      case 'facebook':
        window.open(this.urlService.getSocialMediaUrl('FACEBOOK'), '_blank');
        break;
      case 'twitter':
        window.open(this.urlService.getSocialMediaUrl('TWITTER'), '_blank');
        break;
    }
  }
}
