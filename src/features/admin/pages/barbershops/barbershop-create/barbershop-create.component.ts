import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CreateBarbershopRequest, BarbershopOperatingHoursCreate } from '../../../../barbershop/models/barbershop.model';

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
    { value: 1, name: 'Lunes' },
    { value: 2, name: 'Martes' },
    { value: 3, name: 'Miércoles' },
    { value: 4, name: 'Jueves' },
    { value: 5, name: 'Viernes' },
    { value: 6, name: 'Sábado' },
    { value: 7, name: 'Domingo' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.barbershopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      addressText: ['', [Validators.minLength(5), Validators.maxLength(200)]],
      logoUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      operatingHours: this.fb.array(this.createOperatingHoursControls())
    });
  }

  // Custom validator for time range
  private createOperatingHoursControls(): FormGroup[] {
    return this.daysOfWeek.map(day =>
      this.fb.group({
        dayOfWeek: [day.value, [Validators.required]],
        isClosed: [false],
        openingTime: ['09:00'],
        closingTime: ['18:00'],
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

  getDayName(dayValue: number): string {
    const day = this.daysOfWeek.find(d => d.value === dayValue);
    return day ? day.name : '';
  }

  get f() {
    return this.barbershopForm.controls;
  }

  onSubmit(): void {
    if (this.barbershopForm.valid) {
      this.loading = true;

      const formData: CreateBarbershopRequest = {
        name: this.barbershopForm.value.name,
        phoneNumber: this.barbershopForm.value.phoneNumber || undefined,
        email: this.barbershopForm.value.email || undefined,
        addressText: this.barbershopForm.value.addressText || undefined,
        logoUrl: this.barbershopForm.value.logoUrl || undefined,
        operatingHours: this.barbershopForm.value.operatingHours.map((hour: any) => ({
          dayOfWeek: hour.dayOfWeek,
          isClosed: hour.isClosed,
          openingTime: hour.isClosed ? undefined : hour.openingTime,
          closingTime: hour.isClosed ? undefined : hour.closingTime,
          notes: hour.notes || undefined
        }))
      };

      // Simulate API call
      setTimeout(() => {
        console.log('Barbershop created:', formData);
        this.loading = false;
        this.router.navigate(['/admin/barbershops']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbershops']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.barbershopForm.controls).forEach(key => {
      const control = this.barbershopForm.get(key);
      control?.markAsTouched();
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
          case 'phoneNumber':
            return 'Ingresa un número de teléfono válido (10 dígitos)';
          case 'logoUrl':
            return 'Ingresa una URL de imagen válida';
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
