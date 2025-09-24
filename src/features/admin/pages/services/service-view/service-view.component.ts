import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService } from '../../../../service/services/service.service';
import { BarbershopService } from '../../../../barbershop/services';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { ServiceResponseDto, UpdateServiceRequestDto } from '../../../../../shared/models/service.models';
import { BarbershopResponse } from '../../../../barbershop/models';

@Component({
  selector: 'app-service-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PreloaderComponent],
  templateUrl: './service-view.component.html'
})
export class ServiceViewComponent implements OnInit {
  // Data properties
  service: ServiceResponseDto | null = null;
  barbershop: BarbershopResponse | null = null;

  // State properties
  loading = true;
  error: string | null = null;
  serviceId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private barbershopService: BarbershopService
  ) {
    this.serviceId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.serviceId) {
      this.loadServiceData();
    } else {
      this.error = 'ID de servicio no válido';
      this.loading = false;
    }
  }

  private async loadServiceData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load service data
      this.service = await this.getServiceById(this.serviceId);

      if (this.service) {
        // Load related data
        await this.loadBarbershopData(this.service.barbershopId);
      } else {
        this.error = 'Servicio no encontrado';
      }
    } catch (error) {
      console.error('Error loading service data:', error);
      this.error = 'Error al cargar los datos del servicio';
    } finally {
      this.loading = false;
    }
  }

  private getServiceById(serviceId: string): Promise<ServiceResponseDto | null> {
    return new Promise((resolve, reject) => {
      this.serviceService.getServiceById(serviceId).subscribe({
        next: (service) => resolve(service),
        error: (error) => {
          console.error('Error fetching service:', error);
          resolve(null);
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

  // Helper methods for template
  getServiceName(): string {
    return this.service?.name || 'Nombre no disponible';
  }

  getServiceDescription(): string {
    return this.service?.description || 'Sin descripción';
  }

  getServicePrice(): string {
    if (!this.service?.price) return 'Precio no disponible';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(this.service.price);
  }

  getServiceDuration(): string {
    if (!this.service?.durationMinutes) return 'Duración no disponible';
    return `${this.service.durationMinutes} minutos`;
  }

  getBarbershopName(): string {
    return this.barbershop?.name || 'Barbería no disponible';
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

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/admin/services']);
  }

  editService(): void {
    this.router.navigate(['/admin/services/edit', this.serviceId]);
  }

  deleteService(): void {
    const serviceName = this.getServiceName();

    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${serviceName}"? Esta acción no se puede deshacer.`)) {
      this.serviceService.deleteService(this.serviceId).subscribe({
        next: () => {
          console.log('Service deleted successfully');
          this.router.navigate(['/admin/services']);
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          alert('Error al eliminar el servicio. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

  toggleStatus(): void {
    if (!this.service) return;

    const newStatus = !this.service.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    const serviceName = this.getServiceName();

    if (confirm(`¿Estás seguro de que deseas ${action} el servicio "${serviceName}"?`)) {
      const updatedService: UpdateServiceRequestDto = {
        name: this.service.name,
        description: this.service.description,
        price: this.service.price,
        durationMinutes: this.service.durationMinutes
      };

      this.serviceService.updateService(this.serviceId, updatedService).subscribe({
        next: (updated) => {
          // Actualizar el servicio en la interfaz después de la respuesta exitosa
          if (updated) {
            // Crear una copia del servicio actual y actualizar su estado
            this.service = {
              ...updated,
              isActive: newStatus
            };
          }
          console.log(`Service status updated to ${newStatus}`);
        },
        error: (error) => {
          console.error('Error updating service status:', error);
          alert(`Error al ${action} el servicio. Por favor, inténtalo de nuevo.`);
        }
      });
    }
  }
}
