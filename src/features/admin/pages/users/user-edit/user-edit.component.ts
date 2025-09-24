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
      profilePictureUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
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
      next: (response) => {
        const user = response; // Manejar tanto respuesta envuelta como directa
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          profilePictureUrl: user.profilePictureUrl || '',
          role: user.role,
          isActive: user.isActive
        });
        this.loadingUser = false;

        // Usar mensaje del backend si está disponible
        const successMessage = `Información de ${user.firstName} ${user.lastName} cargada exitosamente`;
        this.notificationService.success(successMessage, 3000);
      },
      error: (error: any) => {
        // Priorizar mensaje del backend
        const backendMessage = error.error?.message;
        const errorMessage = backendMessage || this.getErrorMessage(error, 'cargar la información del usuario');
        this.notificationService.error(errorMessage, 6000);
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
        profilePictureUrl: formValue.profilePictureUrl || undefined,
        role: formValue.role,
        isActive: formValue.isActive
      };

      this.userService.updateUser(this.userId, updateUserRequest).subscribe({
        next: (response) => {
          // Usar mensaje del backend si está disponible
          const user = response; // Manejar tanto respuesta envuelta como directa
          const userName = `${user.firstName} ${user.lastName}`;
          const successMessage = `Usuario ${userName} actualizado exitosamente`;
          this.notificationService.success(successMessage, 4000);
          this.router.navigate(['/admin/users']);
        },
        error: (error: any) => {
          // Priorizar mensaje del backend
          const backendMessage = error.error?.message;
          const errorMessage = backendMessage || this.getErrorMessage(error, 'actualizar el usuario');
          this.notificationService.error(errorMessage, 6000);
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.userForm.valid) {
        this.notificationService.warning('Por favor, completa todos los campos requeridos correctamente', 4000);
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
        if (fieldName === 'phoneNumber') {
          return 'Formato de teléfono inválido';
        }
        if (fieldName === 'profilePictureUrl') {
          return 'URL de imagen inválida. Debe ser una URL válida que termine en .jpg, .jpeg, .png, .gif o .webp';
        }
        return 'Formato inválido';
      }
    }

    return '';
  }

  /**
   * Obtiene un mensaje de error más descriptivo basado en el HttpErrorResponse
   * Solo se usa como fallback cuando no hay mensaje del backend
   */
  private getErrorMessage(error: any, action: string): string {
    switch (error.status) {
      case 0:
        return `No se pudo ${action}. Verifica tu conexión a internet y vuelve a intentarlo.`;
      case 400:
        return `Error al ${action}: Los datos enviados no son válidos. Verifica que todos los campos sean correctos.`;
      case 401:
        return `Error al ${action}: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.`;
      case 403:
        return `Error al ${action}: No tienes permisos suficientes para realizar esta acción.`;
      case 404:
        return `Error al ${action}: El usuario solicitado no fue encontrado. Es posible que haya sido eliminado.`;
      case 409:
        return `Error al ${action}: Conflicto con los datos existentes. Verifica la información e intenta nuevamente.`;
      case 422:
        return `Error al ${action}: Los datos proporcionados no son válidos o están incompletos.`;
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
