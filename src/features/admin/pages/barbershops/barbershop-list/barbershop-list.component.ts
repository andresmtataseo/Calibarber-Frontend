import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-barbershop-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Gestión de Barberías</h1>
          <p class="text-base-content/70 mt-1">Administra las barberías del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="createBarbershop()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Barbería
        </button>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Lista de Barberías</h3>
            <p class="text-base-content/50">Aquí se mostrarán todas las barberías registradas</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BarbershopListComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar barberías desde el servicio
  }

  createBarbershop(): void {
    this.router.navigate(['/admin/barbershops/create']);
  }
}