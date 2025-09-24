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
      profilePictureUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
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
        profilePictureUrl: formValue.profilePictureUrl || undefined,
        role: formValue.role
      };

      this.userService.createUser(createUserRequest).subscribe({
        next: (user) => {
          const userName = `${user.firstName} ${user.lastName}`;
          this.notificationService.success(`Usuario ${userName} creado exitosamente`, 4000);
          this.router.navigate(['/admin/users']);
        },
        error: (error: any) => {
          const errorMessage = this.getErrorMessage(error, 'crear el usuario');
          this.notificationService.error(errorMessage, 6000);
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.notificationService.warning('Por favor, completa todos los campos requeridos correctamente', 4000);
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
        if (fieldName === 'phoneNumber') {
          return 'Formato de teléfono inválido';
        }
        if (fieldName === 'profilePictureUrl') {
          return 'URL de imagen inválida. Debe ser una URL válida que termine en .jpg, .jpeg, .png, .gif o .webp';
        }
        return 'Formato inválido';
      }
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }

    return '';
  }

  /**
   * Obtiene un mensaje de error más descriptivo basado en el HttpErrorResponse
   */
  private getErrorMessage(error: any, action: string): string {
    if (error.error?.message) {
      return `Error al ${action}: ${error.error.message}`;
    }
    
    switch (error.status) {
      case 0:
        return `No se pudo ${action}. Verifica tu conexión a internet y vuelve a intentarlo.`;
      case 400:
        return `Error al ${action}: Los datos enviados no son válidos. Verifica que el email no esté en uso y que todos los campos sean correctos.`;
      case 401:
        return `Error al ${action}: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.`;
      case 403:
        return `Error al ${action}: No tienes permisos suficientes para realizar esta acción.`;
      case 409:
        return `Error al ${action}: Ya existe un usuario con este email. Por favor, utiliza un email diferente.`;
      case 422:
        return `Error al ${action}: Los datos proporcionados no son válidos. Verifica que la contraseña tenga al menos 8 caracteres y que todos los campos estén completos.`;
      case 500:
        return `Error interno del servidor al ${action}. Por favor, intenta nuevamente en unos minutos.`;
      case 502:
      case 503:
      case 504:
        return `El servicio no está disponible temporalmente. Por favor, intenta ${action} más tarde.`;
      default:
        return `Error inesperado al ${action}. Código de error: ${error.status}. Por favor, contacta al administrador si el problema persiste.`;
    }
  }
}
