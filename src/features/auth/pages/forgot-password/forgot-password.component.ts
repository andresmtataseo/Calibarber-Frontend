import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  onSubmit() {
    // Por el momento, no hacer nada
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