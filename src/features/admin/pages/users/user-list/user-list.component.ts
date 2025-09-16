import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../user/services/user.service';
import { UserResponse, UserRole } from '../../../../user/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { UrlService } from '../../../../../core/services/url.service';
import { NotificationService } from '../../../../../shared/components/notification/notification.service';
import { PreloaderComponent } from '../../../../../shared/components/preloader/preloader.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PreloaderComponent],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly urlService = inject(UrlService);
  private readonly notificationService = inject(NotificationService);

  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  loading = false;
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  pageSize = 10;

  // Ordenamiento
  sortBy = 'userId';
  sortDir: 'asc' | 'desc' = 'asc';

  // Subject para el debounce de búsqueda
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.filterUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        // Extraer datos del wrapper ApiResponseDto con estructura de paginación
        const userData = response.data?.content || response.data || [];
        this.users = Array.isArray(userData) ? userData : [];
        this.filterUsers();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading users:', error);
        this.notificationService.error('Error al cargar los usuarios');
        this.users = []; // Asegurar que users sea siempre un array
        this.filteredUsers = [];
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onRoleFilter(): void {
    this.currentPage = 1;
    this.filterUsers();
  }

  onStatusFilter(): void {
    this.currentPage = 1;
    this.filterUsers();
  }

  private filterUsers(): void {
    let filtered = [...this.users];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por rol
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filtrar por estado
    if (this.selectedStatus) {
      if (this.selectedStatus === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (this.selectedStatus === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    // Aplicar ordenamiento
    filtered = this.sortUsers(filtered);

    this.filteredUsers = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Ajustar página actual si es necesario
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  // Métodos de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterUsers();
    }
  }

  // Métodos de utilidad
  getUserFullName(user: UserResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getUserRoleDisplay(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'USER': 'Usuario',
      'BARBER': 'Barbero'
    };
    return roleMap[role] || role;
  }

  getUserStatusDisplay(user: UserResponse): string {
    return user.isActive ? 'Activo' : 'Inactivo';
  }

  getRoleBadgeClass(role: string): string {
    const classMap: { [key: string]: string } = {
      'ADMIN': 'badge-error',
      'USER': 'badge-primary',
      'BARBER': 'badge-secondary'
    };
    return classMap[role] || 'badge-neutral';
  }

  getStatusBadgeClass(user: UserResponse): string {
    return user.isActive ? 'badge-success' : 'badge-error';
  }

  getAvatarUrl(user: UserResponse): string {
    if (user.profilePictureUrl) {
      return user.profilePictureUrl;
    }
    // Generar avatar con las iniciales del nombre
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    return this.urlService.generateAvatarUrl(initials, '570df8', 'fff', 48);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Métodos de navegación
  viewUser(userId: string): void {
    this.router.navigate(['/admin/users/view', userId]);
  }

  editUser(userId: string): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  createUser(): void {
    this.router.navigate(['/admin/users/create']);
  }

  // Método para trackBy en ngFor
  trackByUserId(index: number, user: UserResponse): string {
    return user.userId;
  }

  // Método para obtener páginas visibles en la paginación
  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
  // Exponer Math para uso en template
  Math = Math;

  // Métodos auxiliares para filtros en template
  getActiveUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getAdminUsersCount(): number {
    return this.users.filter(u => u.role === UserRole.ROLE_ADMIN).length;
  }

  getBarberUsersCount(): number {
    return this.users.filter(u => u.role === UserRole.ROLE_BARBER).length;
  }

  // Métodos de ordenamiento
  onSort(sortBy: string): void {
    this.sortBy = sortBy;
    this.filterUsers();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.filterUsers();
  }

  private sortUsers(users: UserResponse[]): UserResponse[] {
    return users.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'isActive':
          aValue = a.isActive;
          bValue = b.isActive;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.userId;
          bValue = b.userId;
      }

      if (aValue < bValue) {
        return this.sortDir === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Método para cambiar el tamaño de página
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.filterUsers();
  }
}
