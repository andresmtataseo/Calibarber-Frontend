import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-edit',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-base-content">Editar Servicio</h1>
        <p class="text-base-content/70 mt-1">Modifica los detalles del servicio</p>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Editar Servicio</h3>
            <p class="text-base-content/50">Formulario para editar el servicio seleccionado</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ServiceEditComponent {
  constructor(private router: Router) {}
}