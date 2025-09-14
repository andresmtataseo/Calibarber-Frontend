import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BarbershopService } from '../../../../barbershop/services/barbershop.service';
import { BarbershopResponse, UpdateBarbershopRequest, BarbershopOperatingHours } from '../../../../barbershop/models/barbershop.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-barbershop-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './barbershop-edit.component.html',
  styleUrls: ['./barbershop-edit.component.css']
})
export class BarbershopEditComponent implements OnInit {
  barbershopForm: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;
  barbershop: BarbershopResponse | null = null;
  barbershopId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private barbershopService: BarbershopService
  ) {
    this.barbershopForm = this.createForm();
  }

  ngOnInit(): void {
    this.barbershopId = this.route.snapshot.paramMap.get('id');
    if (this.barbershopId) {
      this.loadBarbershopData();
    } else {
      this.error = 'ID de barbería no válido';
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      logoUrl: [''],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      addressText: ['', [Validators.required]],
      operatingHours: this.fb.array(this.createOperatingHoursControls())
    });
  }

  private createOperatingHoursControls() {
    const days = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday
    return days.map(day => this.fb.group({
      dayOfWeek: [day],
      isClosed: [true],
      openingTime: [''],
      closingTime: ['']
    }));
  }

  get operatingHours(): FormArray {
    return this.barbershopForm.get('operatingHours') as FormArray;
  }

  getOperatingHoursControls() {
    return this.operatingHours.controls;
  }

  private loadBarbershopData(): void {
    if (!this.barbershopId) return;

    this.loading = true;
    this.error = null;

    this.barbershopService.getBarbershopById(this.barbershopId)
      .pipe(
        catchError(error => {
          console.error('Error loading barbershop:', error);
          this.error = this.getErrorMessage(error);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(barbershop => {
        if (barbershop) {
          this.barbershop = barbershop;
          this.populateForm();
        }
      });
  }

  private populateForm(): void {
    if (!this.barbershop) return;

    this.barbershopForm.patchValue({
      name: this.barbershop.name,
      logoUrl: this.barbershop.logoUrl || '',
      phoneNumber: this.barbershop.phoneNumber || '',
      email: this.barbershop.email || '',
      addressText: this.barbershop.addressText || ''
    });

    // Update operating hours
    const operatingHoursArray = this.barbershopForm.get('operatingHours') as FormArray;
    if (this.barbershop.operatingHours && this.barbershop.operatingHours.length > 0) {
      this.barbershop.operatingHours.forEach((hour, index) => {
        if (operatingHoursArray.at(index)) {
          operatingHoursArray.at(index).patchValue({
            dayOfWeek: hour.dayOfWeek,
            isClosed: hour.isClosed,
            openingTime: hour.openingTime || '',
            closingTime: hour.closingTime || ''
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.barbershopForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.barbershopId) {
      this.error = 'ID de barbería no válido';
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.barbershopForm.value;
    const updateRequest: UpdateBarbershopRequest = {
      name: formValue.name,
      logoUrl: formValue.logoUrl || undefined,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
      addressText: formValue.addressText,
      operatingHours: formValue.operatingHours.map((hour: any) => ({
        dayOfWeek: hour.dayOfWeek,
        isClosed: hour.isClosed,
        openingTime: !hour.isClosed ? hour.openingTime : undefined,
        closingTime: !hour.isClosed ? hour.closingTime : undefined
      }))
    };

    this.barbershopService.updateBarbershop(this.barbershopId, updateRequest)
      .pipe(
        catchError(error => {
          console.error('Error updating barbershop:', error);
          this.error = this.getErrorMessage(error);
          return of(null);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe(response => {
        if (response) {
          console.log('Barbershop updated successfully:', response);
          this.router.navigate(['/admin/barbershops']);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.barbershopForm.controls).forEach(key => {
      const control = this.barbershopForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          Object.keys(arrayControl.value).forEach(arrayKey => {
            arrayControl.get(arrayKey)?.markAsTouched();
          });
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbershops']);
  }

  getDayName(dayNumber: number): string {
    const dayNames: { [key: number]: string } = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo'
    };
    return dayNames[dayNumber] || `Día ${dayNumber}`;
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 404) {
      return 'Barbería no encontrada';
    }
    if (error?.status === 403) {
      return 'No tienes permisos para editar esta barbería';
    }
    if (error?.status === 500) {
      return 'Error interno del servidor';
    }
    return 'Error al procesar la solicitud';
  }

  retryLoad(): void {
    this.error = null;
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
