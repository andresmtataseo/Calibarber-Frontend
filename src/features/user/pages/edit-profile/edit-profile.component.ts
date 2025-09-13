import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent, NotificationType } from '../../../../shared/components/notification/notification.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserResponse } from '../../models/user.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent implements OnInit, OnDestroy {
  editForm: FormGroup;
  isLoading = false;
  isSaving = false;
  user: UserResponse | null = null;

  // Propiedades para el componente de notificación
  showNotification = false;
  notificationMessage = '';
  notificationType: NotificationType = 'error';

  private destroy$ = new Subject<void>();
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      phoneNumber: ['', [
        Validators.maxLength(20),
        Validators.pattern(/^\+?[1-9]\d{1,14}$/)
      ]],
      profilePictureUrl: ['', [
        Validators.maxLength(500),
        Validators.pattern(/^https?:\/\/.*$/)
      ]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el perfil del usuario actual
   */
  private loadUserProfile() {
    this.isLoading = true;
    const currentUserId = this.authService.getCurrentUser()?.id;

    if (!currentUserId) {
      this.showErrorNotification('No se pudo obtener la información del usuario');
      this.router.navigate(['/profile']);
      return;
    }

    this.userService.getUserById(currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.showErrorNotification('Error al cargar el perfil del usuario');
          console.error('Error loading user profile:', error);
        }
      });
  }

  /**
   * Llena el formulario con los datos del usuario
   */
  private populateForm(user: UserResponse) {
    this.editForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      profilePictureUrl: user.profilePictureUrl || ''
    });
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario
   */
  get f() {
    return this.editForm.controls;
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.editForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    } else {
      return field.invalid && (field.dirty || field.touched);
    }
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      const fieldLabels: { [key: string]: string } = {
        email: 'El email',
        firstName: 'El nombre',
        lastName: 'El apellido'
      };
      return `${fieldLabels[fieldName] || 'Este campo'} es obligatorio`;
    }

    if (errors['email']) return 'El formato del email no es válido';
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `No puede exceder ${maxLength} caracteres`;
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (errors['pattern']) {
      if (fieldName === 'firstName' || fieldName === 'lastName') {
        return 'Solo puede contener letras y espacios';
      }
      if (fieldName === 'phoneNumber') {
        return 'El formato del teléfono no es válido';
      }
      if (fieldName === 'profilePictureUrl') {
        return 'La URL debe comenzar con http:// o https://';
      }
    }

    return 'Campo inválido';
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit() {
    if (this.editForm.valid && this.user) {
      this.isSaving = true;
      this.hideNotification();

      const formData = this.editForm.value;

      // Preparar datos para actualización (sin incluir campos que no se pueden cambiar)
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
        ...(formData.profilePictureUrl && { profilePictureUrl: formData.profilePictureUrl })
      };

      this.userService.updateUser(this.user.userId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.showSuccessNotification('¡Perfil actualizado exitosamente!');
            // Redirigir al perfil después de un breve delay
            setTimeout(() => {
              this.router.navigate(['/profile']);
            }, 2000);
          },
          error: (error) => {
            this.isSaving = false;
            this.showErrorNotification(error.message || 'Error al actualizar el perfil. Inténtalo de nuevo.');
          },
          complete: () => {
            this.isSaving = false;
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      this.showErrorNotification('Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  /**
   * Verifica si el formulario es válido y no está guardando
   */
  isFormValid(): boolean {
    return this.editForm.valid && !this.isSaving;
  }

  /**
   * Cancela la edición y regresa al perfil
   */
  onCancel() {
    this.router.navigate(['/profile']);
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.hideNotification();
  }

  /**
   * Muestra una notificación de error
   */
  private showErrorNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;

    // Auto-ocultar después de 5 segundos
    setTimeout(() => this.hideNotification(), 5000);
  }

  /**
   * Muestra una notificación de éxito
   */
  private showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;

    // Auto-ocultar después de 3 segundos
    setTimeout(() => this.hideNotification(), 3000);
  }

  /**
   * Oculta la notificación
   */
  private hideNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }
}
