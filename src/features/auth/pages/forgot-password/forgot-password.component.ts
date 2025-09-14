import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../shared/components/notification';
import { PreloaderComponent } from '../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PreloaderComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
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

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success(`${response.message} Redirigiendo a la página de restablecimiento...`);
          this.router.navigate(['/reset-password']);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.');
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

  // El servicio global de notificaciones maneja automáticamente la visualización y limpieza

  isFormValid(): boolean {
    return this.forgotPasswordForm.valid && !this.isLoading;
  }
}
