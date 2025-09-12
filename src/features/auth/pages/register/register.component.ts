import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { SignUpRequestDto } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

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
      this.errorMessage = '';

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
          // Registro exitoso, redirigir al usuario
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al registrar usuario. Inténtalo de nuevo.';
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
    }
  }

  /**
   * Verifica si el formulario es válido y no está cargando
   */
  isFormValid(): boolean {
    return this.registerForm.valid && !this.isLoading;
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.errorMessage = '';
  }
}
