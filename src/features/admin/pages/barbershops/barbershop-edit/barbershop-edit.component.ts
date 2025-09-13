import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Service {
  id: string;
  name: string;
  selected: boolean;
}

interface Barbershop {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  openingTime: string;
  closingTime: string;
  capacity: number;
  parkingAvailable: boolean;
  wifiAvailable: boolean;
  airConditioning: boolean;
  logoUrl: string;
  coverImageUrl: string;
  services: string[];
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-barbershop-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './barbershop-edit.component.html',
  styleUrl: './barbershop-edit.component.css'
})
export class BarbershopEditComponent implements OnInit {
  barbershopForm!: FormGroup;
  loading = false;
  loadingBarbershop = false;
  barbershopId!: string;
  
  // Available services
  availableServices: Service[] = [
    { id: '1', name: 'Corte de cabello', selected: false },
    { id: '2', name: 'Barba', selected: false },
    { id: '3', name: 'Bigote', selected: false },
    { id: '4', name: 'Afeitado clásico', selected: false },
    { id: '5', name: 'Tratamientos capilares', selected: false },
    { id: '6', name: 'Coloración', selected: false },
    { id: '7', name: 'Peinado', selected: false },
    { id: '8', name: 'Masaje capilar', selected: false },
    { id: '9', name: 'Limpieza facial', selected: false },
    { id: '10', name: 'Cejas', selected: false }
  ];

  // Colombian states
  states = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
    'Vaupés', 'Vichada'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.barbershopId = this.route.snapshot.params['id'];
    this.initializeForm();
    this.loadBarbershop();
  }

  private initializeForm(): void {
    this.barbershopForm = this.fb.group({
      // Basic Information
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      
      // Contact Information
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      
      // Address Information
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      
      // Business Hours
      openingTime: ['', [Validators.required]],
      closingTime: ['', [Validators.required]],
      
      // Additional Information
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      parkingAvailable: [false],
      wifiAvailable: [false],
      airConditioning: [false],
      
      // Images
      logoUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      coverImageUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      
      // Status
      status: ['active', [Validators.required]]
    }, {
      validators: [this.timeValidator]
    });
  }

  private loadBarbershop(): void {
    this.loadingBarbershop = true;
    
    // Simulate API call
    setTimeout(() => {
      const mockBarbershop = this.getMockBarbershop();
      if (mockBarbershop) {
        this.populateForm(mockBarbershop);
      }
      this.loadingBarbershop = false;
    }, 1000);
  }

  private getMockBarbershop(): Barbershop | null {
    // Mock data - in real app, this would come from API
    const barbershops: Barbershop[] = [
      {
        id: '1',
        name: 'Barbería Central',
        description: 'Una barbería tradicional con más de 20 años de experiencia en el centro de la ciudad.',
        phone: '+57 300 123 4567',
        email: 'central@barberia.com',
        website: 'https://www.barberiacentral.com',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
        postalCode: '110111',
        openingTime: '08:00',
        closingTime: '20:00',
        capacity: 6,
        parkingAvailable: true,
        wifiAvailable: true,
        airConditioning: true,
        logoUrl: 'https://example.com/logo.jpg',
        coverImageUrl: 'https://example.com/cover.jpg',
        services: ['Corte de cabello', 'Barba', 'Bigote'],
        status: 'active'
      }
    ];
    
    return barbershops.find(b => b.id === this.barbershopId) || null;
  }

  private populateForm(barbershop: Barbershop): void {
    this.barbershopForm.patchValue({
      name: barbershop.name,
      description: barbershop.description,
      phone: barbershop.phone,
      email: barbershop.email,
      website: barbershop.website,
      address: barbershop.address,
      city: barbershop.city,
      state: barbershop.state,
      postalCode: barbershop.postalCode,
      openingTime: barbershop.openingTime,
      closingTime: barbershop.closingTime,
      capacity: barbershop.capacity,
      parkingAvailable: barbershop.parkingAvailable,
      wifiAvailable: barbershop.wifiAvailable,
      airConditioning: barbershop.airConditioning,
      logoUrl: barbershop.logoUrl,
      coverImageUrl: barbershop.coverImageUrl,
      status: barbershop.status
    });

    // Set selected services
    this.availableServices.forEach(service => {
      service.selected = barbershop.services.includes(service.name);
    });
  }

  // Custom validator for time range
  private timeValidator(group: FormGroup): { [key: string]: any } | null {
    const openingTime = group.get('openingTime')?.value;
    const closingTime = group.get('closingTime')?.value;
    
    if (openingTime && closingTime) {
      const opening = new Date(`2000-01-01T${openingTime}:00`);
      const closing = new Date(`2000-01-01T${closingTime}:00`);
      
      if (opening >= closing) {
        return { timeRange: true };
      }
    }
    
    return null;
  }

  get f() {
    return this.barbershopForm.controls;
  }

  onServiceChange(service: Service, event: Event): void {
    const target = event.target as HTMLInputElement;
    service.selected = target.checked;
  }

  isServiceSelected(service: Service): boolean {
    return service.selected;
  }

  getSelectedServices(): Service[] {
    return this.availableServices.filter(service => service.selected);
  }

  getServicesError(): string | null {
    const selectedServices = this.getSelectedServices();
    if (selectedServices.length === 0) {
      return 'Debe seleccionar al menos un servicio';
    }
    return null;
  }

  onSubmit(): void {
    if (this.barbershopForm.valid && this.getSelectedServices().length > 0) {
      this.loading = true;
      
      const formData = {
        ...this.barbershopForm.value,
        services: this.getSelectedServices().map(s => s.name)
      };
      
      // Simulate API call
      setTimeout(() => {
        console.log('Barbershop updated:', formData);
        this.loading = false;
        this.router.navigate(['/admin/barbershops']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/barbershops']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.barbershopForm.controls).forEach(key => {
      const control = this.barbershopForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.barbershopForm.get(fieldName);
    
    if (field && field.invalid && field.touched) {
      const errors = field.errors;
      
      if (errors?.['required']) {
        return 'Este campo es obligatorio';
      }
      
      if (errors?.['email']) {
        return 'Ingresa un email válido';
      }
      
      if (errors?.['minlength']) {
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
      
      if (errors?.['maxlength']) {
        return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      }
      
      if (errors?.['pattern']) {
        switch (fieldName) {
          case 'phone':
            return 'Ingresa un número de teléfono válido';
          case 'website':
            return 'Ingresa una URL válida (http:// o https://)';
          case 'postalCode':
            return 'Ingresa un código postal válido (6 dígitos)';
          case 'logoUrl':
          case 'coverImageUrl':
            return 'Ingresa una URL de imagen válida';
          default:
            return 'Formato inválido';
        }
      }
      
      if (errors?.['min']) {
        return `Valor mínimo: ${errors['min'].min}`;
      }
      
      if (errors?.['max']) {
        return `Valor máximo: ${errors['max'].max}`;
      }
    }
    
    return null;
  }

  getFormError(): string | null {
    if (this.barbershopForm.errors?.['timeRange']) {
      return 'La hora de apertura debe ser anterior a la hora de cierre';
    }
    return null;
  }
}