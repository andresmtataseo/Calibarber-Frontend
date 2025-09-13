import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SignUpRequestDto } from '../../../../shared/models/auth.models';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { NotificationType } from '../../../../shared/components/notification/notification.component';
import { PreloaderComponent } from '../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NotificationComponent, PreloaderComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;

  // Propiedades para el componente de notificación
  showNotification = false;
  notificationMessage = '';
  notificationType: NotificationType = 'error';

  // Estados para validación de email
  isCheckingEmail = false;
  emailAvailabilityMessage = '';
  isEmailAvailable: boolean | null = null;
  private emailCheckTimeout: any;
  private destroy$ = new Subject<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&].*$/)
      ]],
      confirmPassword: ['', [Validators.required]],
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
      ]],

    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.setupEmailValidation();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.emailCheckTimeout) {
      clearTimeout(this.emailCheckTimeout);
    }
  }

  /**
   * Configura la validación en tiempo real del email
   */
  private setupEmailValidation() {
    const emailControl = this.registerForm.get('email');
    if (emailControl) {
      emailControl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          debounceTime(500), // Esperar 500ms después del último cambio
          distinctUntilChanged(),
          filter(email => {
            // Solo verificar si el email tiene formato válido
            const isValidFormat = emailControl.valid && email && email.trim().length > 0;
            if (!isValidFormat) {
              this.resetEmailValidation();
            }
            return isValidFormat;
          })
        )
        .subscribe(email => {
          this.checkEmailAvailability(email);
        });
    }
  }

  /**
   * Verifica la disponibilidad del email
   */
  private checkEmailAvailability(email: string) {
    this.isCheckingEmail = true;
    this.emailAvailabilityMessage = '';
    this.isEmailAvailable = null;

    this.authService.checkEmailAvailability(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isCheckingEmail = false;
          this.emailAvailabilityMessage = response.message;
          this.isEmailAvailable = response.available;
        },
        error: (error) => {
          this.isCheckingEmail = false;
          this.emailAvailabilityMessage = 'Error al verificar el email';
          this.isEmailAvailable = null;
        }
      });
  }

  /**
   * Resetea el estado de validación del email
   */
  private resetEmailValidation() {
    this.isCheckingEmail = false;
    this.emailAvailabilityMessage = '';
    this.isEmailAvailable = null;
  }

  // Validador para confirmar que las contraseñas coincidan
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Getter para facilitar el acceso a los controles del formulario
  get f() {
    return this.registerForm.controls;
  }

  // Método para verificar si un campo tiene errores
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  // Método para obtener el mensaje de error de un campo
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      const fieldLabels: { [key: string]: string } = {
        email: 'El email',
        password: 'La contraseña',
        confirmPassword: 'La confirmación de contraseña',
        firstName: 'El nombre',
        lastName: 'El apellido',


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
      if (fieldName === 'password') {
        return 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial';
      }
      if (fieldName === 'profilePictureUrl') {
        return 'La URL debe comenzar con http:// o https://';
      }
    }
    if (errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return 'Campo inválido';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.hideNotification();

      const formData = this.registerForm.value;
      // Remover confirmPassword del objeto a enviar
      const { confirmPassword, ...registerData } = formData;

      // Limpiar campos opcionales vacíos
      const signUpData: SignUpRequestDto = {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        ...(registerData.phoneNumber && { phoneNumber: registerData.phoneNumber }),
        ...(registerData.profilePictureUrl && { profilePictureUrl: registerData.profilePictureUrl })
      };

      this.authService.signUp(signUpData).subscribe({
        next: (response) => {
          this.showSuccessNotification('¡Cuenta creada exitosamente!');
          // Registro exitoso, redirigir al perfil de usuario después de un breve delay
          setTimeout(() => {
            this.router.navigate(['/user/profile']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.showErrorNotification(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.showErrorNotification('Por favor, completa todos los campos requeridos correctamente.');
    }
  }

  /**
   * Verifica si el formulario es válido y no está cargando
   */
  isFormValid(): boolean {
    const isFormValid = this.registerForm.valid && !this.isLoading;
    const isEmailValid = this.isEmailAvailable === true || this.isEmailAvailable === null;
    return isFormValid && isEmailValid && !this.isCheckingEmail;
  }

  /**
   * Limpia el mensaje de error
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
  }

  /**
   * Muestra una notificación de éxito
   */
  private showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
  }

  /**
   * Oculta la notificación
   */
  private hideNotification(): void {
    this.showNotification = false;
    this.notificationMessage = '';
  }
}
