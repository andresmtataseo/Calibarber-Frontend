import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Gestión de Pagos</h1>
          <p class="text-base-content/70 mt-1">Administra los pagos del sistema</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-center py-12">
            <svg class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="text-lg font-medium text-base-content/70 mb-2">Lista de Pagos</h3>
            <p class="text-base-content/50">Aquí se mostrarán todos los pagos registrados</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentListComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar pagos desde el servicio
  }
}