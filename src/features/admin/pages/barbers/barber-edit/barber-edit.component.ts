import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BarberService } from '../../../../barber/services';
import { BarbershopService } from '../../../../barbershop/services';
import { UserService } from '../../../../user/services';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { BarbershopResponse } from '../../../../barbershop/models';
import { UserResponse } from '../../../../user/models';
import { BarberResponse, UpdateBarberRequest, CreateBarberAvailabilityRequest } from '../../../../barber/models';
import { DayOfWeek } from '../../../../barbershop/models/operating-hours.model';
import { forkJoin } from 'rxjs';

interface DayAvailability {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-barber-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PreloaderComponent],
  templateUrl: './barber-edit.component.html'
})
export class BarberEditComponent implements OnInit {
  barberForm: FormGroup;
  loading = false;
  isSubmitting = false;
  barberId: string | null = null;
  availableBarbershops: BarbershopResponse[] = [];
  availableUsers: UserResponse[] = [];
  currentBarber: BarberResponse | null = null;

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
    private route: ActivatedRoute,
    private barberService: BarberService,
    private barbershopService: BarbershopService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.barberForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.barberId = this.route.snapshot.paramMap.get('id');

    if (this.barberId) {
      // Primero cargar datos iniciales, luego los datos del barbero
      this.loadInitialData();
    } else {
      this.notificationService.error('ID de barbero no válido');
      this.router.navigate(['/admin/barbers']);
    }
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      userId: [{value: '', disabled: true}, [Validators.required]],
      barbershopId: ['', [Validators.required]],
      specialization: [''],
      isActive: [true, [Validators.required]],
      availability: this.fb.array(this.createDefaultAvailability())
    });
  }

  private createDefaultAvailability(): FormGroup[] {
    return this.daysOfWeek.map(day => {
      const group = this.fb.group({
        dayOfWeek: [day.value],
        isAvailable: [false],
        startTime: [{value: '09:00', disabled: true}],
        endTime: [{value: '18:00', disabled: true}]
      });

      // Suscribirse a cambios en isAvailable para habilitar/deshabilitar campos de tiempo
      group.get('isAvailable')?.valueChanges.subscribe(isAvailable => {
        if (isAvailable) {
          group.get('startTime')?.enable();
          group.get('endTime')?.enable();
        } else {
          group.get('startTime')?.disable();
          group.get('endTime')?.disable();
        }
      });

      return group;
    });
  }

  private loadInitialData(): void {
    this.loading = true;

    forkJoin({
      barbershops: this.barbershopService.getAllBarbershops(),
      users: this.userService.getAllUsers(0, 100) // Cargar más usuarios
    }).subscribe({
      next: (response) => {
        // Manejar respuesta de barberías
        if (response.barbershops?.data) {
          this.availableBarbershops = Array.isArray(response.barbershops.data.content)
            ? response.barbershops.data.content
            : Array.isArray(response.barbershops.data)
            ? response.barbershops.data
            : [];
        }

        // Manejar respuesta de usuarios
        if (response.users?.data) {
          this.availableUsers = Array.isArray(response.users.data.content)
            ? response.users.data.content
            : Array.isArray(response.users.data)
            ? response.users.data
            : [];
        }



        // Después de cargar los datos iniciales, cargar los datos del barbero
        if (this.barberId) {
          this.loadBarberData(this.barberId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        const message = error.error?.message || 'Error al cargar los datos iniciales';
        this.notificationService.error(message);
        this.loading = false;
      }
    });
  }

  private loadBarberData(id: string): void {
    this.loading = true;

    this.barberService.getBarberById(id).subscribe({
      next: (barber) => {
        this.currentBarber = barber;
        this.populateForm(barber);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading barber data:', error);

        // Manejo específico de errores
        let errorMessage = error.error?.message || 'Error al cargar los datos del barbero';
        if (error.message && error.message.includes('no encontrado')) {
          errorMessage = `Barbero con ID ${id} no encontrado`;
        } else if (error.status === 404) {
          errorMessage = `Barbero con ID ${id} no existe`;
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para acceder a este barbero';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        this.notificationService.error(errorMessage);
        this.loading = false;
        this.router.navigate(['/admin/barbers']);
      }
    });
  }

  private populateForm(barber: BarberResponse): void {

    this.barberForm.patchValue({
      userId: barber.userId,
      barbershopId: barber.barbershopId,
      specialization: barber.specialization || '',
      isActive: barber.isActive
    });

    // Deshabilitar el campo de usuario para edición
    this.barberForm.get('userId')?.disable();


    // Cargar disponibilidades del barbero si existen
    this.loadBarberAvailabilities(barber.barberId);
  }

  private loadBarberAvailabilities(barberId: string): void {
    this.barberService.getBarberAvailability(barberId).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.updateAvailabilityForm(response.data);
        }
      },
      error: (error) => {
        console.warn('No se pudieron cargar las disponibilidades del barbero:', error);
        const message = error.error?.message || 'Error al obtener disponibilidades del barbero';
        // No mostrar error al usuario, las disponibilidades son opcionales
      }
    });
  }

  private updateAvailabilityForm(availabilities: any[]): void {
    const availabilityArray = this.barberForm.get('availability') as FormArray;

    availabilities.forEach(availability => {
      const dayIndex = this.daysOfWeek.findIndex(day => day.value === availability.dayOfWeek);
      if (dayIndex !== -1) {
        const dayControl = availabilityArray.at(dayIndex) as FormGroup;
        dayControl.patchValue({
          isAvailable: availability.isAvailable,
          startTime: availability.startTime,
          endTime: availability.endTime
        });
      }
    });
  }

  get f() {
    return this.barberForm.controls;
  }

  getAvailabilityControls() {
    const availabilityArray = this.barberForm.get('availability') as FormArray;
    return availabilityArray ? availabilityArray.controls as FormGroup[] : [];
  }

  getDayName(dayOfWeek: DayOfWeek): string {
    const day = this.daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.name : '';
  }

  isDayAvailable(dayControl: any): boolean {
    return dayControl.get('isAvailable')?.value || false;
  }

  getDayOfWeekFromControl(dayControl: any): DayOfWeek {
    return dayControl.get('dayOfWeek')?.value;
  }

  onSubmit(): void {
    if (this.barberForm.valid && this.barberId) {
      this.isSubmitting = true;

      // Obtener valores del formulario incluyendo campos deshabilitados
      const formValue = this.barberForm.getRawValue();
      const availabilities = formValue.availability as DayAvailability[];

      const updateData: UpdateBarberRequest = {
        specialization: formValue.specialization,
        isActive: formValue.isActive
      };



      this.barberService.updateBarber(this.barberId, updateData).subscribe({
        next: (updatedBarber) => {
          const message = 'Barbero actualizado exitosamente';
          this.notificationService.success(message);

          // Actualizar disponibilidades si hay cambios
          if (availabilities && availabilities.length > 0) {
            this.updateBarberAvailabilities(updatedBarber.barberId, availabilities);
          } else {
            this.router.navigate(['/admin/barbers']);
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          const message = error.error?.message || 'Error al actualizar el barbero';
          this.notificationService.error(message);
          this.isSubmitting = false;
        }
      });
    } else {

      this.markFormGroupTouched();
    }
  }



  getFieldError(fieldName: string): string | null {
    const field = this.barberForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Formato de email inválido';
      }
    }

    return null;
  }

  private updateBarberAvailabilities(barberId: string, availabilities: DayAvailability[]): void {
    // Primero obtener las disponibilidades existentes para eliminarlas
    this.barberService.getBarberAvailability(barberId).subscribe({
      next: (response) => {
        const existingAvailabilities = response.data || [];

        // Eliminar todas las disponibilidades existentes
        const deleteRequests = existingAvailabilities.map(availability =>
          this.barberService.deleteAvailability(availability.barberAvailabilityId)
        );

        // Si no hay disponibilidades existentes, proceder directamente a crear las nuevas
        const deleteObservable = deleteRequests.length > 0 ? forkJoin(deleteRequests) : forkJoin([]);

        deleteObservable.subscribe({
          next: () => {
            // Crear las nuevas disponibilidades
            this.createNewAvailabilities(barberId, availabilities);
          },
          error: (error) => {
            console.error('Error al eliminar disponibilidades existentes:', error);
            const message = error.error?.message || 'Error al actualizar las disponibilidades';
            this.notificationService.error(message);
            this.isSubmitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener disponibilidades existentes:', error);
        // Si no se pueden obtener las existentes, intentar crear las nuevas directamente
        this.createNewAvailabilities(barberId, availabilities);
      }
    });
  }

  private createNewAvailabilities(barberId: string, availabilities: DayAvailability[]): void {
    const availabilityRequests: CreateBarberAvailabilityRequest[] = availabilities
      .filter(availability => availability.isAvailable)
      .map(availability => ({
        barberId,
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isAvailable: availability.isAvailable
      }));

    if (availabilityRequests.length === 0) {
      const message = 'Barbero actualizado exitosamente';
      this.notificationService.success(message);
      this.router.navigate(['/admin/barbers']);
      this.isSubmitting = false;
      return;
    }

    forkJoin(
      availabilityRequests.map(request =>
        this.barberService.createAvailability(request)
      )
    ).subscribe({
      next: (responses) => {
        const message = 'Barbero y disponibilidades actualizados exitosamente';
        this.notificationService.success(message);
        this.router.navigate(['/admin/barbers']);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al crear nuevas disponibilidades:', error);
        const message = error.error?.message || 'Barbero actualizado, pero hubo un error al configurar las disponibilidades';
        this.notificationService.error(message);
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbers']);
  }

  trackByUserId(index: number, user: UserResponse): string {
    return user.userId;
  }

  trackByBarbershopId(index: number, barbershop: BarbershopResponse): string {
    return barbershop.barbershopId;
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
