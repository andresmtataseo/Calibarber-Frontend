import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../../../barber/services/barber.service';
import { BarberResponse } from '../../../../barber/models/barber.model';
import { UserService } from '../../../../user/services/user.service';
import { UserResponse } from '../../../../user/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, forkJoin } from 'rxjs';
import { UrlService } from '../../../../../core/services/url.service';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';

@Component({
  selector: 'app-barber-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './barber-list.component.html'
})
export class BarberListComponent implements OnInit {
  barbers: BarberResponse[] = [];
  barbersWithUserData: (BarberResponse & { user?: UserResponse })[] = [];
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
  sortBy = 'barberId';
  sortDir = 'asc';

  private readonly router = inject(Router);
  private readonly barberService = inject(BarberService);
  private readonly userService = inject(UserService);
  private readonly urlService = inject(UrlService);
  private readonly notificationService = inject(NotificationService);

  constructor() {}

  ngOnInit(): void {
    this.loadBarbers();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadBarbers();
    });
  }

  loadBarbers(): void {
    this.loading = true;

    this.barberService.getAllBarbers(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (response) => {
        if (response.data) {
          this.barbers = response.data.content || [];
          this.totalElements = response.data.totalElements || 0;
          this.totalPages = response.data.totalPages || 0;

          if (this.barbers.length === 0) {
            const message = response.message || 'No se encontraron barberos';
            this.notificationService.warning(message, 3000);
            this.barbersWithUserData = [];
            this.loading = false;
          } else {
            const message = response.message || `Se cargaron ${this.barbers.length} barberos exitosamente`;
            this.notificationService.success(message, 2000);
            this.loadUserDataForBarbers();
          }
        } else {
          this.barbers = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.barbersWithUserData = [];
          this.loading = false;
          const message = response.message || 'No se encontraron datos de barberos';
          this.notificationService.warning(message, 3000);
        }
      },
      error: (error: HttpErrorResponse) => {
        const message = error.error?.message || 'Error al cargar barberos';
        this.notificationService.error(message, 8000);
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  private loadUserDataForBarbers(): void {
    if (this.barbers.length === 0) {
      this.barbersWithUserData = [];
      this.loading = false;
      return;
    }

    const userIds = this.barbers.map(barber => barber.userId);
    const userRequests = userIds.map(userId => this.userService.getUserById(userId));

    forkJoin(userRequests).subscribe({
      next: (users: UserResponse[]) => {
        this.barbersWithUserData = this.barbers.map((barber, index) => ({
          ...barber,
          user: users[index]
        }));
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.warning('No se pudieron cargar todos los datos de usuario de los barberos', 5000);
        // Si falla la carga de usuarios, mostrar barberos sin datos de usuario
        this.barbersWithUserData = this.barbers.map(barber => ({ ...barber }));
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBarbers();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0; // Reset to first page
    this.loadBarbers();
  }

  onSort(field: string): void {
    this.sortBy = field;
    this.loadBarbers();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadBarbers();
  }

  editBarber(id: string): void {
    this.router.navigate(['/admin/barbers/edit', id]);
  }

  viewBarber(id: string): void {
    this.router.navigate(['/admin/barbers/view', id]);
  }

  deleteBarber(barber: BarberResponse & { user?: UserResponse }): void {
    if (!barber) {
      this.notificationService.warning('No se puede eliminar: información del barbero no disponible', 4000);
      return;
    }

    const barberName = barber.user ? `${barber.user.firstName} ${barber.user.lastName}` : `Barbero ${barber.barberId}`;

    if (confirm(`¿Estás seguro de que deseas eliminar al barbero "${barberName}"?\n\nEsta acción no se puede deshacer.`)) {
      this.barberService.deleteBarber(barber.barberId).subscribe({
        next: (response) => {
          const message = `El barbero "${barberName}" ha sido eliminado exitosamente`;
          this.notificationService.success(message, 4000);
          this.loadBarbers();
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error?.message || 'Error al eliminar barbero';
          this.notificationService.error(message, 8000);
        }
      });
    }
  }

  createBarber(): void {
    this.router.navigate(['/admin/barbers/create']);
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

  // Método auxiliar para usar Math.min en el template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Método para generar avatar del barbero
  getAvatarUrl(barber: BarberResponse & { user?: UserResponse }): string {
    if (barber.user?.profilePictureUrl) {
      return barber.user.profilePictureUrl;
    }
    // Generar avatar con las iniciales del nombre
    if (barber.user) {
      const initials = `${barber.user.firstName.charAt(0)}${barber.user.lastName.charAt(0)}`.toUpperCase();
      return this.urlService.generateAvatarUrl(initials, '570df8', 'fff', 48);
    }
    // Fallback si no hay datos de usuario
    return this.urlService.generateAvatarUrl('B', '570df8', 'fff', 48);
  }

  // Método para obtener el nombre completo del barbero
  getBarberFullName(barber: BarberResponse & { user?: UserResponse }): string {
    if (barber.user) {
      return `${barber.user.firstName} ${barber.user.lastName}`;
    }
    return `Barbero ${barber.barberId}`;
  }

  // Método para obtener el estado del barbero
  getBarberStatus(barber: BarberResponse): string {
    return barber.isActive ? 'Activo' : 'Inactivo';
  }

  // Método para obtener la clase CSS del estado
  getStatusBadgeClass(barber: BarberResponse): string {
    return barber.isActive ? 'badge-success' : 'badge-error';
  }
}
