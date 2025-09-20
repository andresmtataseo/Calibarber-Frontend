import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { UserDto } from '../../../../shared/models/auth.models';

/**
 * Componente AdminDashboard - Panel de administración principal
 *
 * Este componente implementa el dashboard administrativo con:
 * - Sidebar de navegación entre módulos
 * - Área de contenido principal
 * - Diseño responsive con DaisyUI y Tailwind CSS
 * - Control de acceso para administradores
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: UserDto | null = null;
  sidebarCollapsed = false;
  isMobile = false;

  /**
   * Elementos del menú de navegación administrativa
   */
  menuItems = [
    {
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0',
      label: 'Dashboard',
      route: '/admin',
      active: true
    },
    {
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      label: 'Usuarios',
      route: '/admin/users',
      active: false
    },
    {
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      label: 'Barberos',
      route: '/admin/barbers',
      active: false
    },
    {
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      label: 'Barberías',
      route: '/admin/barbershops',
      active: false
    },
    {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      label: 'Servicios',
      route: '/admin/services',
      active: false
    },
    {
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      label: 'Citas',
      route: '/admin/appointments',
      active: false
    }
  ];

  ngOnInit(): void {
    this.loadCurrentUser();
    this.checkAdminAccess();
    this.checkScreenSize();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga la información del usuario actual
   */
  private loadCurrentUser(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.currentUser = authState.user;
      });
  }

  /**
   * Verifica si el usuario tiene acceso de administrador
   */
  private checkAdminAccess(): void {
    if (!this.currentUser || this.currentUser.role !== 'ROLE_ADMIN') {
      this.router.navigate(['/']);
    }
  }

  /**
   * Alterna el estado del sidebar (colapsado/expandido)
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * Verifica el tamaño de pantalla para comportamiento responsive
   */
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    // En móviles, el sidebar inicia colapsado
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Configura el listener para cambios de tamaño de pantalla
   */
  private setupResizeListener(): void {
    // El HostListener se encarga de esto ahora
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const wasMobile = this.isMobile;
    this.checkScreenSize();

    // Si cambió de móvil a desktop, expandir sidebar
    if (wasMobile && !this.isMobile) {
      this.sidebarCollapsed = false;
    }
    // Si cambió de desktop a móvil, colapsar sidebar
    else if (!wasMobile && this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  /**
   * Navega a una ruta específica y actualiza el estado activo del menú
   * @param item - Item del menú seleccionado
   */
  navigateToRoute(item: any): void {
    // Desactivar todos los items
    this.menuItems.forEach(menuItem => menuItem.active = false);

    // Activar el item seleccionado
    item.active = true;

    // Navegar a la ruta
    if (item.route === '/admin') {
      // Para el dashboard principal, navegar a la ruta base
      this.router.navigate(['/admin']);
    } else {
      // Para otros módulos, navegar a la ruta específica
      this.router.navigate([item.route]);
    }
  }


}
