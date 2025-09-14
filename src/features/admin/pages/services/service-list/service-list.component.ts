import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Gestión de Servicios</h1>
          <p class="text-base-content/70 mt-1">Administra los servicios disponibles</p>
        </div>
        <button class="btn btn-primary" (click)="createService()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Servicio
        </button>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Lista de Servicios</h3>
            <p class="text-base-content/50">Aquí se mostrarán todos los servicios disponibles</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ServiceListComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar servicios desde el servicio
  }

  createService(): void {
    this.router.navigate(['/admin/services/create']);
  }
}