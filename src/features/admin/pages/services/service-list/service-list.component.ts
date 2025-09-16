import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ServiceService } from '../../../../service/services/service.service';
import { ServiceResponse } from '../../../../service/models/service.model';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { NotificationService } from '../../../../../shared/components/notification';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PreloaderComponent],
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

  constructor(
    private router: Router,
    private serviceService: ServiceService,
    private toastService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          this.handleError(error);
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
          this.handleError(error);
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
  }

  /**
   * Maneja errores en las peticiones
   */
  private handleError(error: any): void {
    console.error('Error al cargar servicios:', error);
    this.toastService.error('Error al cargar los servicios');
    this.loading = false;
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
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) {
      this.loading = true;
      this.serviceService.deleteService(service.serviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Servicio eliminado correctamente');
            this.loadServices();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
    }
  }

  /**
   * Maneja el cambio en la búsqueda
   */
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 0;
    this.loadServices();
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
