import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-base-content">Crear Nueva Cita</h1>
        <p class="text-base-content/70 mt-1">Programa una nueva cita en el sistema</p>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Formulario de Cita</h3>
            <p class="text-base-content/50">Formulario para crear una nueva cita</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppointmentCreateComponent {
  constructor(private router: Router) {}
}