import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-barber-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Gestión de Barberos</h1>
          <p class="text-base-content/70 mt-1">Administra los barberos del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="createBarber()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Barbero
        </button>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Lista de Barberos</h3>
            <p class="text-base-content/50">Aquí se mostrarán todos los barberos registrados</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BarberListComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar barberos desde el servicio
  }

  createBarber(): void {
    this.router.navigate(['/admin/barbers/create']);
  }
}