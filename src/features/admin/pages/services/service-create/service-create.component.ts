import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ServiceService } from '../../../../service/services/service.service';
import { CreateServiceRequestDto } from '../../../../../shared/models/service.models';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { NotificationService } from '../../../../../shared/components/notification';
import { BarbershopService } from '../../../../barbershop/services/barbershop.service';

interface Barbershop {
  barbershopId: string;
  name: string;
}

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './service-create.component.html'
})
export class ServiceCreateComponent implements OnInit, OnDestroy {
  // Formulario
  serviceForm: FormGroup;

  // Estado de carga
  loading = false;
  isSubmitting = false;

  // Datos para selects
  availableBarbershops: Barbershop[] = [];

  // Control de suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private barbershopService: BarbershopService,
    private toastService: NotificationService
  ) {
    this.serviceForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBarbershops();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crea el formulario con validaciones
   */
  private createForm(): FormGroup {
    return this.fb.group({
      barbershopId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]]
    });
  }

  /**
   * Carga las barberías disponibles
   */
  private loadBarbershops(): void {
    this.loading = true;
    this.barbershopService.getAllBarbershops()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableBarbershops = response.data?.content || [];
          this.loading = false;
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.markFormGroupTouched(this.serviceForm);
      return;
    }

    this.isSubmitting = true;
    const serviceData: CreateServiceRequestDto = this.serviceForm.value;

    this.serviceService.createService(serviceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastService.success('Servicio creado correctamente');
          this.router.navigate(['/admin/services']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.handleError(error);
        }
      });
  }

  /**
   * Cancela la creación y vuelve a la lista
   */
  onCancel(): void {
    this.router.navigate(['/admin/services']);
  }

  /**
   * Obtiene acceso rápido a los controles del formulario
   */
  get f() {
    return this.serviceForm.controls;
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string | null {
    const control = this.serviceForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `No puede tener más de ${maxLength} caracteres`;
    }

    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `El valor mínimo es ${min}`;
    }

    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `El valor máximo es ${max}`;
    }

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Maneja errores en las peticiones
   */
  private handleError(error: any): void {
    console.error('Error:', error);
    this.toastService.error(error.message || 'Ha ocurrido un error');
    this.loading = false;
  }
}