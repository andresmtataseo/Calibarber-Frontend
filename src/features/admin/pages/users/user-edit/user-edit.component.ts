import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { UserService } from '../../../../user/services/user.service';
import { UpdateUserRequest, UserRole } from '../../../../user/models/user.model';
import { NotificationService } from '../../../../../shared/components/notification';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PreloaderComponent],
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  loadingUser = true;
  isSubmitting = false;
  userId: string | null = null;

  roles = [
    { value: UserRole.ROLE_CLIENT, label: 'Cliente' },
    { value: UserRole.ROLE_BARBER, label: 'Barbero' },
    { value: UserRole.ROLE_ADMIN, label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      role: [UserRole.ROLE_CLIENT, [Validators.required]],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser(this.userId);
    }
  }

  loadUser(id: string) {
    this.loadingUser = true;

    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          role: user.role,
          isActive: user.isActive
        });
        this.loadingUser = false;
      },
      error: (error: Error) => {
        this.notificationService.error(`Error al cargar el usuario: ${error.message || 'Ha ocurrido un error inesperado'}`);
        console.error('Error loading user:', error);
        this.loadingUser = false;
      }
    });
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    if (this.userForm.valid && this.userId) {
      this.isSubmitting = true;

      const formValue = this.userForm.value;
      const updateUserRequest: UpdateUserRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || undefined,
        role: formValue.role,
        isActive: formValue.isActive
      };

      // Note: UpdateUserRequest doesn't support password updates
      // Password updates would need a separate endpoint or interface

      this.userService.updateUser(this.userId, updateUserRequest).subscribe({
        next: (user) => {
          this.notificationService.success('El usuario ha sido actualizado exitosamente');
          console.log('Usuario actualizado:', user);

          // Redirigir inmediatamente después de mostrar la notificación
          this.router.navigate(['/admin/users']);
        },
        error: (error: Error) => {
          this.notificationService.error(`Error al actualizar usuario: ${error.message || 'Ha ocurrido un error inesperado al actualizar el usuario'}`);
          console.error('Error updating user:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.userForm.valid) {
        this.notificationService.warning('Por favor, completa todos los campos requeridos correctamente');
      }
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/users']);
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato de teléfono inválido';
      }
    }

    return '';
  }
}
