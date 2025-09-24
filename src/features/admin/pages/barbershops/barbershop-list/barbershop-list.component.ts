import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarbershopService } from '../../../../barbershop/services';
import { BarbershopResponse } from '../../../../barbershop/models';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UrlService } from '../../../../../core/services/url.service';
import { NotificationService } from '../../../../../shared/components/notification';

@Component({
  selector: 'app-barbershop-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './barbershop-list.component.html'
})
export class BarbershopListComponent implements OnInit {
  barbershops: BarbershopResponse[] = [];
  loading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Sorting
  sortBy = 'name';
  sortDir = 'asc';

  private readonly router = inject(Router);
  private readonly barbershopService = inject(BarbershopService);
  private readonly urlService = inject(UrlService);
  private readonly notificationService = inject(NotificationService);

  constructor() {}

  ngOnInit(): void {
    this.loadBarbershops();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadBarbershops();
    });
  }

  loadBarbershops(): void {
    this.loading = true;

    this.barbershopService.getAllBarbershops(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (response) => {
        if (response.data && response.data.content) {
          this.barbershops = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
          
          if (this.barbershops.length === 0) {
            this.notificationService.warning('No se encontraron barberías', 3000);
          } else {
            this.notificationService.success(`Se cargaron ${this.barbershops.length} barberías exitosamente`, 2000);
          }
        } else {
          this.barbershops = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.notificationService.warning('No se encontraron datos de barberías', 3000);
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.error(this.getErrorMessage(error, 'cargar barberías'), 8000);
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBarbershops();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page
    this.loadBarbershops();
  }

  onSort(field: string): void {
    this.sortBy = field;
    this.loadBarbershops();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadBarbershops();
  }

  editBarbershop(id: string): void {
    this.router.navigate(['/admin/barbershops/edit', id]);
  }

  viewBarbershop(id: string): void {
    this.router.navigate(['/admin/barbershops/view', id]);
  }

  deleteBarbershop(barbershop: BarbershopResponse): void {
    if (!barbershop) {
      this.notificationService.warning('No se puede eliminar: información de la barbería no disponible', 4000);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la barbería "${barbershop.name}"?\n\nEsta acción no se puede deshacer.`)) {
      this.barbershopService.deleteBarbershop(barbershop.barbershopId).subscribe({
        next: () => {
          this.notificationService.success(`La barbería "${barbershop.name}" ha sido eliminada exitosamente`, 4000);
          this.loadBarbershops();
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error(this.getErrorMessage(error, 'eliminar barbería'), 8000);
        }
      });
    }
  }

  createBarbershop(): void {
    this.router.navigate(['/admin/barbershops/create']);
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  private getErrorMessage(error: HttpErrorResponse, context: string = 'realizar la operación'): string {
    if (error.error?.message) {
      return `Error al ${context}: ${error.error.message}`;
    }
    
    switch (error.status) {
      case 0:
        return `Error de conexión al ${context}. Verifica tu conexión a internet.`;
      case 400:
        return `Solicitud inválida al ${context}. Verifica los datos enviados.`;
      case 401:
        return `No autorizado para ${context}. Inicia sesión nuevamente.`;
      case 403:
        return `No tienes permisos para ${context}.`;
      case 404:
        return `La barbería que intentas ${context} no fue encontrada.`;
      case 409:
        return `Conflicto al ${context}. La barbería puede estar siendo usada en otra operación.`;
      case 422:
        return `Datos inválidos para ${context}. Verifica la información proporcionada.`;
      case 500:
        return `Error interno del servidor al ${context}. Inténtalo más tarde.`;
      case 502:
        return `Error de conexión con el servidor al ${context}. Inténtalo más tarde.`;
      case 503:
        return `Servicio no disponible para ${context}. Inténtalo más tarde.`;
      case 504:
        return `Tiempo de espera agotado al ${context}. Inténtalo más tarde.`;
      default:
        return `Error inesperado al ${context}. Código: ${error.status}`;
    }
  }

  // Método auxiliar para usar Math.min en el template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Método para generar avatar con inicial del nombre
  getAvatarUrl(barbershop: BarbershopResponse): string {
    if (barbershop.logoUrl) {
      return barbershop.logoUrl;
    }
    // Generar avatar con la primera letra del nombre
    const initial = barbershop.name.charAt(0).toUpperCase();
    return this.urlService.generateAvatarUrl(initial, '570df8', 'fff', 48);
  }
}
