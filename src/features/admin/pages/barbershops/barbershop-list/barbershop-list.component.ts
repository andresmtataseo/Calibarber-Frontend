import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarbershopService } from '../../../../barbershop/services';
import { BarbershopResponse } from '../../../../barbershop/models';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UrlService } from '../../../../../core/services/url.service';

@Component({
  selector: 'app-barbershop-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './barbershop-list.component.html'
})
export class BarbershopListComponent implements OnInit {
  barbershops: BarbershopResponse[] = [];
  loading = false;
  error: string | null = null;

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
    this.error = null;

    this.barbershopService.getAllBarbershops(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (response) => {
        this.barbershops = response.data.content;
        this.totalElements = response.data.totalElements;
        this.totalPages = response.data.totalPages;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
        console.error('Error loading barbershops:', error);
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
    if (confirm(`¿Estás seguro de que deseas eliminar la barbería "${barbershop.name}"?`)) {
      this.barbershopService.deleteBarbershop(barbershop.barbershopId).subscribe({
        next: () => {
          this.loadBarbershops();
        },
        error: (error: HttpErrorResponse) => {
          this.error = this.getErrorMessage(error);
          console.error('Error deleting barbershop:', error);
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

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 0) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    if (error.status >= 500) {
      return 'Error interno del servidor. Inténtalo más tarde.';
    }
    return 'Ha ocurrido un error inesperado.';
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
