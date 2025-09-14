import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateBarbershopRequest } from '../../../../barbershop/models/barbershop.model';
import { BarbershopService, BarbershopOperatingHoursService } from '../../../../barbershop/services';
import { BarbershopOperatingHoursRequest, DayOfWeek } from '../../../../barbershop/models/operating-hours.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-barbershop-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './barbershop-create.component.html'
})
export class BarbershopCreateComponent implements OnInit {
  barbershopForm!: FormGroup;
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
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private barbershopService: BarbershopService,
    private operatingHoursService: BarbershopOperatingHoursService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.barbershopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      operatingHours: this.fb.array(this.createOperatingHoursControls())
    });
  }

  // Custom validator for time range
  private createOperatingHoursControls(): FormGroup[] {
    return this.daysOfWeek.map(day =>
      this.fb.group({
        dayOfWeek: [day.key, [Validators.required]],
        isOpen: [true],
        openTime: ['09:00'],
        closeTime: ['18:00'],
        notes: ['']
      })
    );
  }

  get operatingHoursArray(): FormArray {
    return this.barbershopForm.get('operatingHours') as FormArray;
  }

  getOperatingHourControl(index: number): FormGroup {
    return this.operatingHoursArray.at(index) as FormGroup;
  }

  getOperatingHoursControls(): FormGroup[] {
    return this.operatingHoursArray.controls as FormGroup[];
  }

  getDayName(dayKey: string): string {
    const day = this.daysOfWeek.find(d => d.key === dayKey);
    return day ? day.name : '';
  }

  get f() {
    return this.barbershopForm.controls;
  }

  onSubmit(): void {
    if (this.barbershopForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.barbershopForm.value;

      // Crear request solo con datos básicos de la barbería
      const createRequest: CreateBarbershopRequest = {
        name: formValue.name,
        addressText: formValue.address,
        phoneNumber: formValue.phone || undefined,
        email: formValue.email || undefined,
        logoUrl: undefined
      };

      // Preparar horarios de operación usando el nuevo modelo
      const operatingHours: BarbershopOperatingHoursRequest[] = formValue.operatingHours.map((hour: any) => ({
        barbershopId: '', // Se asignará después de crear la barbería
        dayOfWeek: this.getDayOfWeekEnum(hour.dayOfWeek) as DayOfWeek,
        openingTime: hour.isOpen ? hour.openTime : null,
        closingTime: hour.isOpen ? hour.closeTime : null,
        isClosed: !hour.isOpen,
        notes: hour.notes || null
      }));

      // Crear la barbería primero
      this.barbershopService.createBarbershop(createRequest)
        .subscribe({
          next: (createdBarbershop) => {
            console.log('Barbería creada exitosamente:', createdBarbershop);
            
            // Asignar el barbershopId a todos los horarios
            const hoursWithBarbershopId = operatingHours.map(hour => ({
              ...hour,
              barbershopId: createdBarbershop.barbershopId
            }));
            
            // Ahora enviar los horarios de operación usando la nueva API
            this.operatingHoursService.createOrUpdateOperatingHours(
              createdBarbershop.barbershopId,
              hoursWithBarbershopId
            ).pipe(
              finalize(() => {
                this.isSubmitting = false;
              })
            ).subscribe({
              next: (createdHours) => {
                console.log('Horarios creados exitosamente:', createdHours);
                this.handleSuccess('Barbería y horarios creados exitosamente');
              },
              error: (error) => {
                console.error('Error al crear los horarios:', error);
                this.errorMessage = 'Barbería creada, pero error al configurar horarios: ' + (error.message || 'Error desconocido');
              }
            });
          },
          error: (error) => {
            console.error('Error al crear la barbería:', error);
            this.errorMessage = error.message || 'Error al crear la barbería';
            this.isSubmitting = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbershops']);
  }



  private getDayOfWeekEnum(dayKey: string): DayOfWeek {
    // El dayKey ya es el enum correcto (MONDAY, TUESDAY, etc.)
    return dayKey as DayOfWeek;
  }

  private getDayOfWeekNumber(dayKey: string): number {
    const dayMap: { [key: string]: number } = {
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6,
      'SUNDAY': 7
    };
    return dayMap[dayKey] || 1;
  }

  private handleSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.router.navigate(['/admin/barbershops']);
    }, 1500);
  }

  private markFormGroupTouched(): void {
    this.markFormGroupTouchedRecursive(this.barbershopForm);
  }

  private markFormGroupTouchedRecursive(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouchedRecursive(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouchedRecursive(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.barbershopForm.get(fieldName);

    if (field && field.invalid && field.touched) {
      const errors = field.errors;

      if (errors?.['required']) {
        return 'Este campo es obligatorio';
      }

      if (errors?.['email']) {
        return 'Ingresa un email válido';
      }

      if (errors?.['minlength']) {
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }

      if (errors?.['maxlength']) {
        return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      }

      if (errors?.['pattern']) {
        switch (fieldName) {
          case 'phone':
            return 'Ingresa un número de teléfono válido';
          default:
            return 'Formato inválido';
        }
      }

      if (errors?.['min']) {
        return `Valor mínimo: ${errors['min'].min}`;
      }

      if (errors?.['max']) {
        return `Valor máximo: ${errors['max'].max}`;
      }
    }

    return null;
  }


}
