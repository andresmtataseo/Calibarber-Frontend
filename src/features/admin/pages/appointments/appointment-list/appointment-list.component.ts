import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Gestión de Citas</h1>
          <p class="text-base-content/70 mt-1">Administra las citas del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="createAppointment()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Crear Cita
        </button>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Lista de Citas</h3>
            <p class="text-base-content/50">Aquí se mostrarán todas las citas programadas</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppointmentListComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar citas desde el servicio
  }

  createAppointment(): void {
    this.router.navigate(['/admin/appointments/create']);
  }
}