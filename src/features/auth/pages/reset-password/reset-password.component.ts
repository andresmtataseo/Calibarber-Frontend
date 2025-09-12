import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      token: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        this.passwordComplexityValidator
      ]],
      confirmNewPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para complejidad de contraseña
  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[@$!%*?&]/.test(value);

    const valid = hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;

    if (!valid) {
      return {
        passwordComplexity: {
          hasLowerCase,
          hasUpperCase,
          hasNumber,
          hasSpecialChar
        }
      };
    }

    return null;
  }

  // Validador para confirmar que las contraseñas coinciden
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const formData = this.resetPasswordForm.value;
      // TODO: Implementar lógica de restablecimiento de contraseña
      console.log('Reset password form submitted:', formData);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        this.resetPasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  // Métodos auxiliares para mostrar errores específicos
  getTokenErrors(): string[] {
    const errors: string[] = [];
    const tokenControl = this.resetPasswordForm.get('token');
    
    if (tokenControl?.touched && tokenControl?.errors) {
      if (tokenControl.errors['required']) {
        errors.push('El token es requerido');
      }
      if (tokenControl.errors['minlength']) {
        errors.push('El token debe tener al menos 10 caracteres');
      }
      if (tokenControl.errors['maxlength']) {
        errors.push('El token no puede exceder 500 caracteres');
      }
    }
    
    return errors;
  }

  getPasswordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.resetPasswordForm.get('newPassword');
    
    if (passwordControl?.touched && passwordControl?.errors) {
      if (passwordControl.errors['required']) {
        errors.push('La contraseña es requerida');
      }
      if (passwordControl.errors['minlength']) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (passwordControl.errors['maxlength']) {
        errors.push('La contraseña no puede exceder 100 caracteres');
      }
      if (passwordControl.errors['passwordComplexity']) {
        const complexity = passwordControl.errors['passwordComplexity'];
        if (!complexity.hasLowerCase) {
          errors.push('Debe contener al menos una letra minúscula');
        }
        if (!complexity.hasUpperCase) {
          errors.push('Debe contener al menos una letra mayúscula');
        }
        if (!complexity.hasNumber) {
          errors.push('Debe contener al menos un número');
        }
        if (!complexity.hasSpecialChar) {
          errors.push('Debe contener al menos un carácter especial (@$!%*?&)');
        }
      }
    }
    
    return errors;
  }

  getConfirmPasswordErrors(): string[] {
    const errors: string[] = [];
    const confirmPasswordControl = this.resetPasswordForm.get('confirmNewPassword');
    
    if (confirmPasswordControl?.touched && confirmPasswordControl?.errors) {
      if (confirmPasswordControl.errors['required']) {
        errors.push('La confirmación de contraseña es requerida');
      }
      if (confirmPasswordControl.errors['minlength']) {
        errors.push('La confirmación debe tener al menos 8 caracteres');
      }
      if (confirmPasswordControl.errors['maxlength']) {
        errors.push('La confirmación no puede exceder 100 caracteres');
      }
    }
    
    if (this.resetPasswordForm.errors?.['passwordMismatch'] && confirmPasswordControl?.touched) {
      errors.push('Las contraseñas no coinciden');
    }
    
    return errors;
  }
}