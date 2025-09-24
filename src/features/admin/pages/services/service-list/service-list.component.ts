import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceService } from '../../../../service/services/service.service';
import { ServiceResponse } from '../../../../service/models/service.model';
import { NotificationService } from '../../../../../shared/components/notification';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-list.component.html'
})
export class ServiceListComponent implements OnInit, OnDestroy {
  // Datos de servicios
  services: ServiceResponse[] = [];

  // Estado de carga
  loading = true;

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Filtros y ordenamiento
  searchTerm = '';
  sortBy = 'createdAt';
  sortDir: 'desc' | 'asc' = 'desc';

  // Control de suscripciones
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private serviceService: ServiceService,
    private notificationService: NotificationService
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura la búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 0;
        this.loadServices();
      });
  }

  /**
   * Carga los servicios con los filtros actuales
   */
  loadServices(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    };

    if (this.searchTerm) {
      this.serviceService.searchServicesByName({
        ...params,
        name: this.searchTerm
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleServicesResponse(response);
        },
        error: (error) => {
          this.notificationService.error(this.getErrorMessage(error, 'búsqueda de servicios'));
          this.loading = false;
        }
      });
    } else {
      this.serviceService.getAllServices(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleServicesResponse(response);
        },
        error: (error) => {
          this.notificationService.error(this.getErrorMessage(error, 'carga de servicios'));
          this.loading = false;
        }
      });
    }
  }

  /**
   * Procesa la respuesta de servicios
   */
  private handleServicesResponse(response: any): void {
    this.services = response.data?.content || [];
    this.totalPages = response.data?.totalPages || 0;
    this.totalElements = response.data?.totalElements || 0;
    this.loading = false;

    if (this.services.length === 0) {
      if (this.searchTerm) {
        this.notificationService.warning(`No se encontraron servicios que coincidan con "${this.searchTerm}"`);
      } else {
        this.notificationService.warning('No hay servicios disponibles');
      }
    } else {
      const message = this.searchTerm 
        ? `Se encontraron ${this.services.length} servicios para "${this.searchTerm}"`
        : `Se cargaron ${this.services.length} servicios correctamente`;
      this.notificationService.success(message);
    }
  }

  /**
   * Maneja errores en las peticiones con mensajes específicos según el contexto y código de estado
   */
  private getErrorMessage(error: any, context: string = 'operación'): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          return `Solicitud inválida durante la ${context}. Verifique los datos enviados.`;
        case 401:
          return `No tiene autorización para realizar esta ${context}. Inicie sesión nuevamente.`;
        case 403:
          return `No tiene permisos suficientes para realizar esta ${context}.`;
        case 404:
          return `El recurso solicitado no fue encontrado durante la ${context}.`;
        case 409:
          return `Conflicto detectado durante la ${context}. El recurso ya existe o está en uso.`;
        case 422:
          return `Los datos proporcionados no son válidos para la ${context}.`;
        case 500:
          return `Error interno del servidor durante la ${context}. Intente nuevamente más tarde.`;
        case 502:
          return `Error de conexión con el servidor durante la ${context}.`;
        case 503:
          return `Servicio no disponible temporalmente durante la ${context}.`;
        default:
          return `Error inesperado durante la ${context}. Código: ${error.status}`;
      }
    }
    return `Error desconocido durante la ${context}. Intente nuevamente.`;
  }

  /**
   * Navega a la página de creación de servicios
   */
  createService(): void {
    this.router.navigate(['/admin/services/create']);
  }

  /**
   * Navega a la página de detalles de un servicio
   */
  viewService(serviceId: string): void {
    this.router.navigate(['/admin/services/view', serviceId]);
  }

  /**
   * Navega a la página de edición de un servicio
   */
  editService(serviceId: string): void {
    this.router.navigate(['/admin/services/edit', serviceId]);
  }

  /**
   * Elimina un servicio
   */
  deleteService(service: ServiceResponse): void {
    if (!service || !service.serviceId) {
      this.notificationService.warning('No se puede eliminar el servicio. Información no disponible.');
      return;
    }

    const confirmMessage = `¿Estás seguro de que deseas eliminar el servicio "${service.name}"?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      this.loading = true;
      this.serviceService.deleteService(service.serviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success(`El servicio "${service.name}" ha sido eliminado correctamente`);
            this.loadServices();
          },
          error: (error) => {
            this.notificationService.error(this.getErrorMessage(error, 'eliminación del servicio'));
            this.loading = false;
          }
        });
    }
  }

  /**
   * Maneja el cambio en la búsqueda
   */
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  /**
   * Cambia el criterio de ordenamiento
   */
  onSort(value: string): void {
    this.sortBy = value;
    this.loadServices();
  }

  /**
   * Cambia la dirección del ordenamiento
   */
  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadServices();
  }

  /**
   * Cambia la página actual
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadServices();
  }

  /**
   * Cambia el tamaño de página
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadServices();
  }

  /**
   * Obtiene el array de páginas para la paginación
   */
  getPaginationArray(): number[] {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (this.totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar un subconjunto de páginas
      let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

      // Ajustar si estamos cerca del final
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Devuelve el mínimo entre dos números
   */
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Obtiene el estado del servicio como texto
   */
  getServiceStatus(service: ServiceResponse): string {
    return service.isActive ? 'Activo' : 'Inactivo';
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getStatusBadgeClass(service: ServiceResponse): string {
    return service.isActive
      ? 'badge-success text-success-content'
      : 'badge-error text-error-content';
  }
}
