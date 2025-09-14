import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UpdateBarbershopRequest, BarbershopResponse } from '../../../../barbershop/models/barbershop.model';
import { BarbershopService, BarbershopOperatingHoursService } from '../../../../barbershop/services';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-barbershop-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './barbershop-edit.component.html'
})
export class BarbershopEditComponent implements OnInit {
  barbershopForm!: FormGroup;
  loading = false;
  barbershopId: string | null = null;
  barbershop: BarbershopResponse | null = null;

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
    private route: ActivatedRoute,
    private barbershopService: BarbershopService,
    private operatingHoursService: BarbershopOperatingHoursService
  ) {}

  ngOnInit(): void {
    this.barbershopId = this.route.snapshot.paramMap.get('id');
    this.initializeForm();
    if (this.barbershopId) {
      this.loadBarbershopData();
    } else {
      this.errorMessage = 'ID de barbería no válido';
    }
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

  private loadBarbershopData(): void {
    if (!this.barbershopId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.barbershopService.getBarbershopById(this.barbershopId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (barbershop) => {
          console.log('Barbería cargada exitosamente:', barbershop);
          this.barbershop = barbershop;
          this.populateForm();
        },
        error: (error) => {
          console.error('Error al cargar la barbería:', error);
          this.errorMessage = error.message || 'Error al cargar la barbería';
        }
      });
  }

  private populateForm(): void {
    if (!this.barbershop) return;

    this.barbershopForm.patchValue({
      name: this.barbershop.name,
      phone: this.barbershop.phoneNumber || '',
      email: this.barbershop.email || '',
      address: this.barbershop.addressText || ''
    });

    // Update operating hours
    const operatingHoursArray = this.barbershopForm.get('operatingHours') as FormArray;
    if (this.barbershop.operatingHours && this.barbershop.operatingHours.length > 0) {
      // Create a map of existing operating hours by day of week
      const existingHours = new Map();
      this.barbershop.operatingHours.forEach(hour => {
        const dayKey = this.getDayKeyFromNumber(hour.dayOfWeek);
        existingHours.set(dayKey, hour);
      });

      // Update form controls with existing data
      this.daysOfWeek.forEach((day, index) => {
        const existingHour = existingHours.get(day.key);
        if (operatingHoursArray.at(index) && existingHour) {
          operatingHoursArray.at(index).patchValue({
            dayOfWeek: day.key,
            isOpen: !existingHour.isClosed,
            openTime: existingHour.openingTime || '09:00',
            closeTime: existingHour.closingTime || '18:00',
            notes: existingHour.notes || ''
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.barbershopForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.barbershopId) {
        this.errorMessage = 'ID de barbería no válido';
        this.isSubmitting = false;
        return;
      }

      const formValue = this.barbershopForm.value;

      const updateRequest: UpdateBarbershopRequest = {
        name: formValue.name,
        addressText: formValue.address,
        phoneNumber: formValue.phone || undefined,
        email: formValue.email || undefined,
        operatingHours: formValue.operatingHours.map((hour: any) => ({
          dayOfWeek: this.getDayOfWeekNumber(hour.dayOfWeek),
          openingTime: hour.isOpen ? hour.openTime : undefined,
          closingTime: hour.isOpen ? hour.closeTime : undefined,
          isClosed: !hour.isOpen,
          notes: hour.notes || undefined
        }))
      };

      this.barbershopService.updateBarbershop(this.barbershopId, updateRequest)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (updatedBarbershop) => {
            console.log('Barbería actualizada exitosamente:', updatedBarbershop);
            this.handleSuccess('Barbería actualizada exitosamente');
          },
          error: (error) => {
            console.error('Error al actualizar la barbería:', error);
            this.errorMessage = error.message || 'Error al actualizar la barbería';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbershops']);
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

  private getDayKeyFromNumber(dayNumber: number): string {
    const dayMap: { [key: number]: string } = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
      7: 'SUNDAY'
    };
    return dayMap[dayNumber] || 'MONDAY';
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

  retryLoad(): void {
    this.errorMessage = '';
    this.loadBarbershopData();
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
