import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ServiceService } from '../../../../service/services/service.service';
import { BarbershopService } from '../../../../barbershop/services';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { BarbershopResponse } from '../../../../barbershop/models';
import { UpdateServiceRequest } from '../../../../service/models/service.model';

@Component({
  selector: 'app-service-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PreloaderComponent],
  templateUrl: './service-edit.component.html'
})
export class ServiceEditComponent implements OnInit {
  serviceForm: FormGroup;
  loading = false;
  isSubmitting = false;
  serviceId: string | null = null;
  availableBarbershops: BarbershopResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private barbershopService: BarbershopService,
    private notificationService: NotificationService
  ) {
    this.serviceForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');

    if (this.serviceId) {
      this.loadInitialData();
    } else {
      this.notificationService.error('ID de servicio no válido');
      this.router.navigate(['/admin/services']);
    }
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      barbershopId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [''],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      isActive: [true, [Validators.required]]
    });
  }

  private loadInitialData(): void {
    this.loading = true;

    // Cargar barberías disponibles y datos del servicio
    this.barbershopService.getAllBarbershops().subscribe({
      next: (response) => {
        // Manejar respuesta de barberías
        if (response?.data) {
          this.availableBarbershops = Array.isArray(response.data.content)
            ? response.data.content
            : Array.isArray(response.data)
            ? response.data
            : [];
        }

        // Después de cargar las barberías, cargar los datos del servicio
        if (this.serviceId) {
          this.loadServiceData(this.serviceId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading barbershops:', error);
        this.notificationService.error('Error al cargar las barberías');
        this.loading = false;
      }
    });
  }

  private loadServiceData(id: string): void {
    this.serviceService.getServiceById(id).subscribe({
      next: (service) => {
        this.populateForm(service);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading service data:', error);

        // Manejo específico de errores
        let errorMessage = 'Error al cargar los datos del servicio';
        if (error.message && error.message.includes('no encontrado')) {
          errorMessage = `Servicio con ID ${id} no encontrado`;
        } else if (error.status === 404) {
          errorMessage = `Servicio con ID ${id} no existe`;
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para acceder a este servicio';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        this.notificationService.error(errorMessage);
        this.loading = false;
        this.router.navigate(['/admin/services']);
      }
    });
  }

  private populateForm(service: any): void {
    this.serviceForm.patchValue({
      barbershopId: service.barbershopId,
      name: service.name,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      isActive: service.isActive
    });

    // Deshabilitar el campo de barbería para edición
    this.serviceForm.get('barbershopId')?.disable();
  }

  get f() {
    return this.serviceForm.controls;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.serviceForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Debe tener al menos ${requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        return `No puede tener más de ${requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        const min = field.errors['min'].min;
        return `El valor mínimo es ${min}`;
      }
      if (field.errors['max']) {
        const max = field.errors['max'].max;
        return `El valor máximo es ${max}`;
      }
    }

    return null;
  }

  onSubmit(): void {
    if (this.serviceForm.valid && this.serviceId) {
      this.isSubmitting = true;

      // Obtener valores del formulario incluyendo campos deshabilitados
      const formValue = this.serviceForm.getRawValue();

      const updateData: UpdateServiceRequest = {
        name: formValue.name,
        description: formValue.description,
        durationMinutes: formValue.durationMinutes,
        price: formValue.price,
        isActive: formValue.isActive
      };

      this.serviceService.updateService(this.serviceId, updateData).subscribe({
        next: () => {
          this.notificationService.success('Servicio actualizado exitosamente');
          this.router.navigate(['/admin/services']);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating service:', error);
          this.notificationService.error('Error al actualizar el servicio');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/services']);
  }

  trackByBarbershopId(index: number, barbershop: BarbershopResponse): string {
    return barbershop.barbershopId;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceForm.controls).forEach(key => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();
    });
  }
}