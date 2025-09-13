import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './barber-edit.component.html',
  styleUrl: './barber-edit.component.css'
})
export class BarberEditComponent implements OnInit {
  barberForm: FormGroup;
  loading = false;
  loadingBarber = true;
  barberId: string | null = null;
  showPassword = false;

  barbershops = [
    { id: 1, name: 'Barbería Central' },
    { id: 2, name: 'Estilo Moderno' },
    { id: 3, name: 'Barbería Clásica' },
    { id: 4, name: 'Nuevo Estilo' }
  ];

  availableSpecialties = [
    'Corte clásico',
    'Corte moderno',
    'Fade',
    'Barba',
    'Afeitado',
    'Diseños',
    'Corte infantil',
    'Tratamientos capilares'
  ];

  experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 años)' },
    { value: 'mid', label: 'Intermedio (2-5 años)' },
    { value: 'senior', label: 'Senior (5+ años)' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.barberForm = this.fb.group({
      // Información Personal
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      dateOfBirth: ['', [Validators.required]],
      
      // Credenciales (opcional en edición)
      password: [''],
      confirmPassword: [''],
      
      // Información Profesional
      barbershopId: ['', [Validators.required]],
      experienceLevel: ['', [Validators.required]],
      yearsOfExperience: ['', [Validators.required, Validators.min(0), Validators.max(50)]],
      specialties: this.fb.array([], [Validators.required]),
      
      // Configuración
      status: ['active', [Validators.required]],
      startDate: ['', [Validators.required]],
      
      // Información Adicional
      bio: [''],
      profileImage: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.barberId = this.route.snapshot.paramMap.get('id');
    if (this.barberId) {
      this.loadBarber(this.barberId);
    }
  }

  get specialtiesArray() {
    return this.barberForm.get('specialties') as FormArray;
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

  loadBarber(id: string) {
    this.loadingBarber = true;
    
    // Simular carga de datos del barbero
    setTimeout(() => {
      const barberData = {
        id: 1,
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos@barberia.com',
        phone: '+57 300 123 4567',
        dateOfBirth: '1990-05-15',
        barbershopId: 1,
        experienceLevel: 'senior',
        yearsOfExperience: 5,
        specialties: ['Corte clásico', 'Barba'],
        status: 'active',
        startDate: '2019-01-15',
        bio: 'Barbero especializado en cortes clásicos y cuidado de barba con más de 5 años de experiencia.',
        profileImage: 'https://example.com/profile.jpg'
      };
      
      // Llenar el formulario con los datos existentes
      this.barberForm.patchValue({
        firstName: barberData.firstName,
        lastName: barberData.lastName,
        email: barberData.email,
        phone: barberData.phone,
        dateOfBirth: barberData.dateOfBirth,
        barbershopId: barberData.barbershopId,
        experienceLevel: barberData.experienceLevel,
        yearsOfExperience: barberData.yearsOfExperience,
        status: barberData.status,
        startDate: barberData.startDate,
        bio: barberData.bio,
        profileImage: barberData.profileImage
      });
      
      // Configurar especialidades
      this.specialtiesArray.clear();
      barberData.specialties.forEach(specialty => {
        this.specialtiesArray.push(this.fb.control(specialty));
      });
      
      this.loadingBarber = false;
    }, 1000);
  }

  get f() {
    return this.barberForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSpecialtyChange(specialty: string, event: any) {
    const specialtiesArray = this.specialtiesArray;
    
    if (event.target.checked) {
      specialtiesArray.push(this.fb.control(specialty));
    } else {
      const index = specialtiesArray.controls.findIndex(x => x.value === specialty);
      if (index >= 0) {
        specialtiesArray.removeAt(index);
      }
    }
  }

  isSpecialtySelected(specialty: string): boolean {
    return this.specialtiesArray.controls.some(control => control.value === specialty);
  }

  onSubmit() {
    if (this.barberForm.valid) {
      this.loading = true;
      
      const barberData = {
        ...this.barberForm.value,
        id: this.barberId,
        name: `${this.barberForm.value.firstName} ${this.barberForm.value.lastName}`,
        specialties: this.specialtiesArray.value
      };
      
      // Remover campos de contraseña si están vacíos
      if (!barberData.password) {
        delete barberData.password;
        delete barberData.confirmPassword;
      }
      
      // Simular actualización de barbero
      setTimeout(() => {
        console.log('Barbero actualizado:', barberData);
        this.loading = false;
        this.router.navigate(['/admin/barbers']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/barbers']);
  }

  private markFormGroupTouched() {
    Object.keys(this.barberForm.controls).forEach(key => {
      const control = this.barberForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.barberForm.get(fieldName);
    
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
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `El valor máximo es ${field.errors['max'].max}`;
      }
    }
    
    return '';
  }

  getSpecialtiesError(): string {
    const specialtiesArray = this.specialtiesArray;
    if (specialtiesArray.invalid && specialtiesArray.touched) {
      if (specialtiesArray.errors?.['required']) {
        return 'Selecciona al menos una especialidad';
      }
    }
    return '';
  }
}