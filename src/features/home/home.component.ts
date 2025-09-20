import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ServiceCardComponent } from '../service/components';
import { ServiceService } from '../service/services/service.service';
import { ServiceResponseDto } from '../../shared/models/service.models';
import { BarberCardComponent } from '../barber/components/barber-card.component';
import { BarberService } from '../barber/services/barber.service';
import { BarberResponse } from '../barber/models/barber.model';
import { GalleryCardComponent, GalleryPhoto } from './components/gallery-card.component';

// Importar Swiper
import { register } from 'swiper/element/bundle';

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

  ngOnInit(): void {
    // Registrar elementos personalizados de Swiper
    register();

    this.loadServices();
    this.loadBarbers();
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

    // Email de la barbería (puedes cambiarlo por el email real)
    const barberiaEmail = 'contacto@calibarber.com';

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

    // Abrir el cliente de email
    window.location.href = mailtoLink;
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
