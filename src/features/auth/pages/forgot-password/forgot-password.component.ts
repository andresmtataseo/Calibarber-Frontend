import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { NotificationType } from '../../../../shared/components/notification/notification.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  
  // Propiedades para el componente de notificación
  showNotification = false;
  notificationType: NotificationType = 'info';
  notificationMessage = '';
  duration = 5000;
  autoClose = true;

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
      this.hideNotification();

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccessNotification(
            `${response.message} Serás redirigido automáticamente a la página de restablecimiento en unos segundos.`
          );
          
          // Redirigir a reset-password después de 3 segundos para dar tiempo a leer el mensaje
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.showErrorNotification(error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.');
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

  // Métodos auxiliares para notificaciones
  private showSuccessNotification(message: string) {
    this.notificationType = 'success';
    this.notificationMessage = message;
    this.showNotification = true;
  }

  private showErrorNotification(message: string) {
    this.notificationType = 'error';
    this.notificationMessage = message;
    this.showNotification = true;
  }

  private hideNotification() {
    this.showNotification = false;
    this.notificationMessage = '';
  }
}