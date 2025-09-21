import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ServiceCardComponent } from '../service/components';
import { ServiceService } from '../service/services/service.service';
import { ServiceResponseDto } from '../../shared/models/service.models';
import { BarberCardComponent } from '../barber/components/barber-card.component';
import { BarberService } from '../barber/services/barber.service';
import { BarberResponse } from '../barber/models/barber.model';
import { GalleryCardComponent, GalleryPhoto } from './components/gallery-card.component';
import { BarbershopService, BarbershopOperatingHoursService } from '../barbershop/services';
import { BarbershopResponse } from '../barbershop/models/barbershop.model';
import { BarbershopOperatingHours } from '../barbershop/models/operating-hours.model';

// Importar Swiper
import { register } from 'swiper/element/bundle';

interface DaySchedule {
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  notes?: string;
}

/**
 * Componente Home - Página de inicio
 *
 * Este componente implementa la página principal de CaliBarber
 * con secciones atractivas para el usuario:
 * - Hero section con llamada a la acción
 * - Información destacada de servicios cargados desde la API
 * - Diseño responsive con DaisyUI y Tailwind CSS
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceCardComponent, BarberCardComponent, GalleryCardComponent],
  templateUrl: './home.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  @ViewChild('barberSwiperRef', { static: false }) barberSwiperRef!: ElementRef;
  @ViewChild('serviceSwiperRef', { static: false }) serviceSwiperRef!: ElementRef;

  private readonly serviceService = inject(ServiceService);
  private readonly barberService = inject(BarberService);
  private readonly barbershopService = inject(BarbershopService);
  private readonly operatingHoursService = inject(BarbershopOperatingHoursService);
  private readonly destroy$ = new Subject<void>();

  /**
   * Información del hero section
   */
  heroContent = {
    title: 'Estilo que trasciende, elegancia que perdura',
  };

  /**
   * Servicios cargados desde la API
   */
  services: ServiceResponseDto[] = [];

  /**
   * Barberos del equipo - se cargarán desde la API
   */
  barbers: BarberResponse[] = [];

  /**
   * Fotos de la galería - datos de muestra
   */
  galleryPhotos: GalleryPhoto[] = [
    {
      id: '1',
      name: 'Corte con degradado',
      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Corte moderno con degradado perfecto',
      category: 'Cortes'
    },
    {
      id: '2',
      name: 'Corte clásico',
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Estilo clásico y elegante',
      category: 'Cortes'
    },
    {
      id: '5',
      name: 'Estilo vintage',
      imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Corte inspirado en los años 50',
      category: 'Vintage'
    },
    {
      id: '6',
      name: 'Corte moderno',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      description: 'Tendencias actuales en cortes',
      category: 'Modernos'
    }
  ];

  /**
   * Estados de carga y error para barberos
   */
  isBarbersLoading = false;
  hasBarbersError = false;
  barbersErrorMessage = '';

  /**
   * Estados de carga y error para servicios
   */
  isLoading = false;
  hasError = false;
  errorMessage = '';

  /**
   * Datos de la barbería (se cargarán desde la API)
   */
  barbershop: BarbershopResponse | null = null;
  operatingHours: BarbershopOperatingHours[] = [];
  displayOperatingHours: DaySchedule[] = [];
  isContactLoading = false;

  /**
   * Días de la semana para mapear horarios
   */
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
   * Información de contacto (se actualizará con datos reales)
   */
  contactInfo = {
    name: 'No disponible',
    address: 'Dirección no disponible',
    phone: 'Teléfono no disponible',
    email: 'Email no disponible'
  };

  /**
   * Información de horarios formateada
   */
  scheduleInfo = {
    weekdays: 'Horarios no disponibles',
    saturday: 'Horarios no disponibles',
    sunday: 'Horarios no disponibles'
  };

  ngOnInit(): void {
    // Registrar elementos personalizados de Swiper
    register();

    this.loadServices();
    this.loadBarbers();
    this.loadBarbershopData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los barberos desde la API
   */
  private loadBarbers(): void {
    this.isBarbersLoading = true;
    this.hasBarbersError = false;

    this.barberService.getAllBarbers(0, 10, 'barberId', 'asc')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data && 'content' in response.data) {
            // Usar directamente BarberResponse sin mapeo adicional
            this.barbers = response.data.content;
          } else {
            this.barbers = [];
          }
          this.isBarbersLoading = false;
        },
        error: (error) => {
          console.error('Error cargando barberos:', error);
          this.hasBarbersError = true;
          this.barbersErrorMessage = error.message || 'Error al cargar los barberos';
          this.isBarbersLoading = false;
        }
      });
  }

  /**
   * Reintenta cargar los barberos
   */
  retryLoadBarbers(): void {
    this.loadBarbers();
  }

  /**
   * Carga los servicios desde la API
   */
  private loadServices(): void {
    this.isLoading = true;
    this.hasError = false;

    this.serviceService.getAllServices({ page: 0, size: 6 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.services = response.data?.content || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando servicios:', error);
          this.hasError = true;
          this.errorMessage = error.message || 'Error al cargar los servicios';
          this.isLoading = false;
        }
      });
  }

  /**
   * Reintenta cargar los servicios
   */
  retryLoadServices(): void {
    this.loadServices();
  }

  /**
   * Maneja la selección de un barbero
   */
  onBarberSelected(barber: BarberResponse): void {
    console.log('Barbero seleccionado:', barber);
    // Aquí se puede implementar la lógica para navegar a la reserva de cita
    // o mostrar más información del barbero
  }

  /**
   * Envía un email usando mailto con los datos del formulario
   */
  sendEmail(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const nombre = formData.get('nombre') as string;
    const apellido = formData.get('apellido') as string;
    const email = formData.get('email') as string;
    const mensaje = formData.get('mensaje') as string;

    // Validar que todos los campos estén completos
    if (!nombre || !apellido || !email || !mensaje) {
      alert('Por favor, completa todos los campos del formulario.');
      return;
    }

    // Usar el email real de la barbería
    const barberiaEmail = this.contactInfo.email;

    // Verificar que el email de la barbería esté disponible
    if (!barberiaEmail || barberiaEmail === 'Email no disponible') {
      alert('Lo sentimos, el email de contacto no está disponible en este momento. Por favor, intenta más tarde o contacta directamente por teléfono.');
      return;
    }

    console.log('Enviando email a:', barberiaEmail);
    console.log('Datos del formulario:', { nombre, apellido, email, mensaje });

    // Construir el asunto y cuerpo del email
    const asunto = encodeURIComponent(`Contacto desde la web - ${nombre} ${apellido}`);
    const cuerpo = encodeURIComponent(
      `Nombre: ${nombre} ${apellido}\n` +
      `Email: ${email}\n\n` +
      `Mensaje:\n${mensaje}\n\n` +
      `---\n` +
      `Este mensaje fue enviado desde el formulario de contacto de CaliBarber.`
    );

    // Crear el enlace mailto
    const mailtoLink = `mailto:${barberiaEmail}?subject=${asunto}&body=${cuerpo}`;
    
    console.log('Enlace mailto generado:', mailtoLink);

    try {
      // Abrir el cliente de email sin cambiar la página actual
      window.open(mailtoLink, '_self');
      
      // Mostrar mensaje de confirmación
      alert('Se ha abierto tu cliente de email. Si no se abrió automáticamente, por favor copia el email: ' + barberiaEmail);
      
      // Limpiar el formulario después de enviar
      form.reset();
    } catch (error) {
      console.error('Error al abrir el cliente de email:', error);
      alert('Error al abrir el cliente de email. Email de contacto: ' + barberiaEmail);
    }
  }

  /**
   * Carga los datos de la barbería
   */
  private loadBarbershopData(): void {
    this.isContactLoading = true;
    
    // Obtener todas las barberías y tomar la primera (igual que en footer)
    this.barbershopService.getAllBarbershops()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isContactLoading = false;
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
          console.error('Error loading barbershop data:', error);
          // Mantener los datos por defecto en caso de error
        }
      });
  }

  /**
   * Actualiza la información de contacto con los datos de la barbería
   */
  private updateContactInfo(): void {
    if (this.barbershop) {
      this.contactInfo = {
        name: this.barbershop.name,
        address: this.barbershop.addressText || 'Dirección no disponible',
        phone: this.barbershop.phoneNumber || 'Teléfono no disponible',
        email: this.barbershop.email || 'Email no disponible'
      };
    }
  }

  /**
   * Carga los horarios de atención desde la API
   */
  private loadOperatingHours(): void {
    if (!this.barbershop?.barbershopId) return;

    this.operatingHoursService.getOperatingHoursByBarbershopId(this.barbershop.barbershopId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.operatingHours = response;
          this.processOperatingHours(this.operatingHours);
          this.updateScheduleInfo();
        },
        error: (error) => {
          console.error('Error cargando horarios:', error);
        }
      });
  }

  /**
   * Procesa los horarios de atención para mostrarlos correctamente
   */
  private processOperatingHours(operatingHours: BarbershopOperatingHours[] = []): void {
    this.displayOperatingHours = this.daysOfWeek.map(day => {
      const dayHours = operatingHours.find(oh => oh.dayOfWeek === day.key);
      
      if (dayHours && !dayHours.isClosed) {
        return {
          dayName: day.name,
          isOpen: true,
          openTime: dayHours.openingTime ? this.formatTime(dayHours.openingTime) : 'No disponible',
          closeTime: dayHours.closingTime ? this.formatTime(dayHours.closingTime) : 'No disponible',
          notes: dayHours.notes
        };
      } else {
        return {
          dayName: day.name,
          isOpen: false,
          openTime: '',
          closeTime: '',
          notes: dayHours?.notes
        };
      }
    });
  }

  /**
   * Actualiza la información de horarios formateada
   */
  private updateScheduleInfo(): void {
    const weekdayHours = this.displayOperatingHours.filter(day => 
      ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(day.dayName) && day.isOpen
    );
    
    const saturdayHours = this.displayOperatingHours.find(day => day.dayName === 'Sábado');
    const sundayHours = this.displayOperatingHours.find(day => day.dayName === 'Domingo');

    // Formatear horarios de lunes a viernes
    if (weekdayHours.length > 0) {
      const firstWeekday = weekdayHours[0];
      const allSameHours = weekdayHours.every(day => 
        day.openTime === firstWeekday.openTime && day.closeTime === firstWeekday.closeTime
      );
      
      if (allSameHours) {
        this.scheduleInfo.weekdays = `• Lunes a Viernes: ${firstWeekday.openTime} - ${firstWeekday.closeTime}`;
      } else {
        this.scheduleInfo.weekdays = '• Lunes a Viernes: Horarios variables';
      }
    } else {
      this.scheduleInfo.weekdays = '• Lunes a Viernes: Cerrado';
    }

    // Formatear horario de sábado
    if (saturdayHours && saturdayHours.isOpen) {
      this.scheduleInfo.saturday = `• Sábados: ${saturdayHours.openTime} - ${saturdayHours.closeTime}`;
    } else {
      this.scheduleInfo.saturday = '• Sábados: Cerrado';
    }

    // Formatear horario de domingo
    if (sundayHours && sundayHours.isOpen) {
      this.scheduleInfo.sunday = `• Domingos: ${sundayHours.openTime} - ${sundayHours.closeTime}`;
    } else {
      this.scheduleInfo.sunday = '• Domingos: Cerrado';
    }
  }

  /**
   * Formatea la hora de 24h a 12h con AM/PM
   */
  private formatTime(time: string): string {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formateando hora:', error);
      return time;
    }
  }

  /**
   * Navegar al slide anterior en la galería
   */
  previousSlide(): void {
    if (this.swiperRef?.nativeElement) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    }
  }

  /**
   * Navegar al siguiente slide en la galería
   */
  nextSlide(): void {
    if (this.swiperRef?.nativeElement) {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
  }

  /**
   * Navegar al slide anterior en el swiper de barberos
   */
  previousBarberSlide(): void {
    if (this.barberSwiperRef?.nativeElement) {
      this.barberSwiperRef.nativeElement.swiper.slidePrev();
    }
  }

  /**
   * Navegar al siguiente slide en el swiper de barberos
   */
  nextBarberSlide(): void {
    if (this.barberSwiperRef?.nativeElement) {
      this.barberSwiperRef.nativeElement.swiper.slideNext();
    }
  }

  /**
   * Navegar al slide anterior en el swiper de servicios
   */
  previousServiceSlide(): void {
    if (this.serviceSwiperRef?.nativeElement) {
      this.serviceSwiperRef.nativeElement.swiper.slidePrev();
    }
  }

  /**
   * Navegar al siguiente slide en el swiper de servicios
   */
  nextServiceSlide(): void {
    if (this.serviceSwiperRef?.nativeElement) {
      this.serviceSwiperRef.nativeElement.swiper.slideNext();
    }
  }
}
