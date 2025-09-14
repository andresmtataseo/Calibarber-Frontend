import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { NotificationService } from '../../../../shared/components/notification';
import { PreloaderComponent } from '../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  changePasswordForm: FormGroup;
  isLoading = false;

  // El servicio global de notificaciones maneja automáticamente la visualización

  private destroy$ = new Subject<void>();

constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
      ]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Componente inicializado
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;

    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  // Getter para facilitar el acceso a los controles del formulario
  get f() {
    return this.changePasswordForm.controls;
  }

  // Método para verificar si un campo tiene errores
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  // Método para obtener el mensaje de error de un campo
  getErrorMessage(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      const fieldLabels: { [key: string]: string } = {
        currentPassword: 'La contraseña actual',
        newPassword: 'La nueva contraseña',
        confirmNewPassword: 'La confirmación de contraseña'
      };
      return `${fieldLabels[fieldName] || 'Este campo'} es obligatorio`;
    }

    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `No puede exceder ${maxLength} caracteres`;
    }

    if (errors['pattern']) {
      if (fieldName === 'newPassword') {
        return 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial';
      }
    }

    if (errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return 'Campo inválido';
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;

      const formData = this.changePasswordForm.value;
      const changePasswordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      };

      this.authService.changePassword(changePasswordData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('¡Contraseña cambiada exitosamente! Redirigiendo al perfil...');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al cambiar la contraseña. Inténtalo de nuevo.';

          // Manejar errores específicos de la API
          if (error.errors) {
            const firstErrorKey = Object.keys(error.errors)[0];
            errorMessage = error.errors[firstErrorKey];
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.notificationService.error(errorMessage);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.changePasswordForm.controls).forEach(key => {
        this.changePasswordForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Por favor, completa todos los campos correctamente.');
    }
  }

  /**
   * Verifica si el formulario es válido y no está cargando
   */
  isFormValid(): boolean {
    return this.changePasswordForm.valid && !this.isLoading;
  }

  /**
   * Limpia el mensaje de error (manejado automáticamente por el servicio global)
   */
  clearError(): void {
    // El servicio global maneja automáticamente la limpieza de notificaciones
  }

  /**
   * Navega de vuelta al perfil
   */
  goBack(): void {
    this.router.navigate(['/profile']);
  }

  // El servicio global de notificaciones maneja automáticamente la visualización y limpieza
}
