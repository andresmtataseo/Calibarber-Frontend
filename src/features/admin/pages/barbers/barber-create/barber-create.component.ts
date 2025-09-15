import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { BarberService } from '../../../../barber/services';
import { BarbershopService } from '../../../../barbershop/services';
import { UserService } from '../../../../user/services';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { BarbershopResponse } from '../../../../barbershop/models';
import { UserResponse } from '../../../../user/models';
import { CreateBarberRequest, CreateBarberAvailabilityRequest } from '../../../../barber/models';
import { DayOfWeek } from '../../../../barbershop/models/operating-hours.model';
import { forkJoin } from 'rxjs';

interface DayAvailability {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-barber-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './barber-create.component.html'
})
export class BarberCreateComponent implements OnInit {
  barberForm!: FormGroup;
  loading = false;
  isSubmitting = false;
  availableBarbershops: BarbershopResponse[] = [];
  availableUsers: UserResponse[] = [];

  daysOfWeek = [
    { name: 'Lunes', value: DayOfWeek.MONDAY },
    { name: 'Martes', value: DayOfWeek.TUESDAY },
    { name: 'Miércoles', value: DayOfWeek.WEDNESDAY },
    { name: 'Jueves', value: DayOfWeek.THURSDAY },
    { name: 'Viernes', value: DayOfWeek.FRIDAY },
    { name: 'Sábado', value: DayOfWeek.SATURDAY },
    { name: 'Domingo', value: DayOfWeek.SUNDAY }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private barberService: BarberService,
    private barbershopService: BarbershopService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadBarbershops();
    this.loadUsers();
  }

  private initializeForm(): void {
    this.barberForm = this.fb.group({
      userId: ['', [Validators.required]],
      barbershopId: ['', [Validators.required]],
      specialization: [''],
      availability: this.fb.array(this.createDefaultAvailability())
    });
  }

  private createDefaultAvailability(): FormGroup[] {
    return this.daysOfWeek.map((day) => this.createAvailabilityGroup(day.value));
  }

  private createAvailabilityGroup(dayOfWeek: DayOfWeek): FormGroup {
    const group = this.fb.group({
      dayOfWeek: [dayOfWeek, Validators.required],
      isAvailable: [false],
      startTime: ['09:00'],
      endTime: ['18:00']
    });

    // Manejar el estado disabled de los campos de tiempo
    group.get('isAvailable')?.valueChanges.subscribe(isAvailable => {
      if (isAvailable) {
        group.get('startTime')?.enable();
        group.get('endTime')?.enable();
      } else {
        group.get('startTime')?.disable();
        group.get('endTime')?.disable();
      }
    });

    // Inicializar el estado disabled
    group.get('startTime')?.disable();
    group.get('endTime')?.disable();

    return group;
  }

  private loadBarbershops(): void {
    this.loading = true;
    // Llamar con parámetros para obtener todas las barberías (página grande)
    this.barbershopService.getAllBarbershops(0, 100).subscribe({
      next: (response) => {
        this.availableBarbershops = response.data?.content || response.data || [];
        this.loading = false;
      },
      error: (error) => {
         this.notificationService.error('Error al cargar las barberías');
         this.loading = false;
       }
     });
  }

  private loadUsers(): void {
    // Llamar con parámetros para obtener todos los usuarios (página grande)
    this.userService.getAllUsers(0, 100).subscribe({
      next: (response) => {
        // Filtrar solo usuarios que no sean barberos ya
        const allUsers = response.data?.content || response.data || [];
        this.availableUsers = allUsers.filter((user: UserResponse) => user.role !== 'ROLE_BARBER');
      },
      error: (error) => {
         this.notificationService.error('Error al cargar los usuarios');
       }
    });
  }

  get f() {
    return this.barberForm.controls;
  }

  getAvailabilityControls(): FormGroup[] {
    return (this.barberForm.get('availability') as FormArray).controls as FormGroup[];
  }

  getDayName(dayOfWeek: DayOfWeek): string {
    const day = this.daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.name : '';
  }

  getFieldError(fieldName: string): string | null {
    const field = this.barberForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors?.['max']) {
        return `El valor máximo es ${field.errors['max'].max}`;
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.barberForm.valid) {
      this.isSubmitting = true;

      const formData = this.barberForm.value;
      const barberData: CreateBarberRequest = {
        userId: formData.userId,
        barbershopId: formData.barbershopId,
        specialization: formData.specialization
      };

      // Primero crear el barbero
      this.barberService.createBarber(barberData).subscribe({
        next: (barberResponse) => {
          // Luego crear las disponibilidades
          this.createBarberAvailabilities(barberResponse.barberId, formData.availability);
        },
        error: (error) => {
          this.notificationService.error('Error al crear el barbero');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private createBarberAvailabilities(barberId: string, availabilities: DayAvailability[]): void {
    // Crear requests de disponibilidad para TODOS los días de la semana
    const availabilityRequests = availabilities.map(availability => {
      const request: CreateBarberAvailabilityRequest = {
        barberId: barberId,
        dayOfWeek: availability.dayOfWeek,
        isAvailable: availability.isAvailable
      };

      // Solo incluir horarios si el día está habilitado
      if (availability.isAvailable) {
        request.startTime = availability.startTime;
        request.endTime = availability.endTime;
      }

      return this.barberService.createAvailability(request);
    });

    // Ejecutar todas las creaciones de disponibilidad en paralelo
    forkJoin(availabilityRequests).subscribe({
      next: (responses) => {
        this.notificationService.success('Barbero y disponibilidades creados exitosamente');
        this.router.navigate(['/admin/barbers']);
      },
      error: (error) => {
        this.notificationService.error('Barbero creado, pero hubo un error al configurar las disponibilidades');
        this.router.navigate(['/admin/barbers']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbers']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.barberForm.controls).forEach(key => {
      const control = this.barberForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              arrayControl.get(nestedKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }


}
