import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { UserService } from '../../../../user/services/user.service';
import { CreateUserRequest, UserRole } from '../../../../user/models/user.model';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PreloaderComponent],
  templateUrl: './user-create.component.html'
})
export class UserCreateComponent {
  userForm: FormGroup;
  loading = false;
  isSubmitting = false;

  roles = [
    { value: UserRole.ROLE_CLIENT, label: 'Cliente' },
    { value: UserRole.ROLE_BARBER, label: 'Barbero' },
    { value: UserRole.ROLE_ADMIN, label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.ROLE_CLIENT, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;

      const formValue = this.userForm.value;
      const createUserRequest: CreateUserRequest = {
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || undefined,
        role: formValue.role
      };

      this.userService.createUser(createUserRequest).subscribe({
        next: (user) => {
          this.notificationService.success('Usuario creado exitosamente');
          console.log('Usuario creado:', user);
          this.router.navigate(['/admin/users']);
        },
        error: (error: Error) => {
          this.notificationService.error(
            error.message || 'Error al crear el usuario. Por favor, verifica los datos e intenta nuevamente.'
          );
          console.error('Error creating user:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Por favor, completa todos los campos requeridos correctamente');
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
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }

    return '';
  }
}
