import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = null;
      this.messageType = null;

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageType = 'success';
          this.message = response.message;
          
          // Redirigir a reset-password después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageType = 'error';
          this.message = error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  get emailError() {
    if (this.email?.errors && (this.email.dirty || this.email.touched)) {
      if (this.email.errors['required']) {
        return 'El correo electrónico es requerido';
      }
      if (this.email.errors['email']) {
        return 'Ingresa un correo electrónico válido';
      }
    }
    return null;
  }
}