import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';
import { UserService } from '../../../../user/services/user.service';
import { UpdateUserRequest, UserRole } from '../../../../user/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  showPassword = false;
  error: string | null = null;
  success: string | null = null;

  roles = [
    { value: UserRole.ROLE_CLIENT, label: 'Cliente' },
    { value: UserRole.ROLE_BARBER, label: 'Barbero' },
    { value: UserRole.ROLE_ADMIN, label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      password: [''],
      confirmPassword: [''],
      role: [UserRole.ROLE_CLIENT, [Validators.required]],
      isActive: [true, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser(this.userId);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value && confirmPassword?.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  loadUser(id: string) {
    this.loadingUser = true;
    this.error = null;

    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          role: user.role,
          isActive: user.isActive,
          password: '',
          confirmPassword: ''
        });
        this.loadingUser = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Error al cargar el usuario';
        console.error('Error loading user:', error);
        this.loadingUser = false;
      }
    });
  }

  get f() {
    return this.userForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.userForm.valid && this.userId) {
      this.isSubmitting = true;
      this.error = null;
      this.success = null;

      const formValue = this.userForm.value;
      const updateUserRequest: UpdateUserRequest = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber || undefined,
        role: formValue.role,
        isActive: formValue.isActive
      };

      // Note: UpdateUserRequest doesn't support password updates
      // Password updates would need a separate endpoint or interface
      if (formValue.password && formValue.password.trim() !== '') {
        console.log('Password update functionality needs separate implementation');
        alert('La actualización de contraseña requiere implementación adicional');
      }

      this.userService.updateUser(this.userId, updateUserRequest).subscribe({
        next: (user) => {
          this.success = 'Usuario actualizado exitosamente';
          console.log('Usuario actualizado:', user);
          
          // Redirigir después de un breve delay para mostrar el mensaje de éxito
          setTimeout(() => {
            this.router.navigate(['/admin/users']);
          }, 1500);
        },
        error: (error: Error) => {
          this.error = error.message || 'Error al actualizar el usuario';
          console.error('Error updating user:', error);
          this.isSubmitting = false;
        }
      });
    } else {
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
        return 'Formato de teléfono inválido';
      }
      if (field.errors['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }

    return '';
  }
}
