import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { UserDto } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html'
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
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      label: 'Usuarios',
      route: '/admin/users',
      active: false
    },
    {
      icon: 'M480.503,312.156c-20.898-20.932-48.609-31.531-76.01-31.498c-14.518-0.011-29.101,3.036-42.747,8.954   L88.464,16.317l-1.469,1.469c-30.018,30.028-30.028,78.736,0,108.766L200.155,239.7l-49.912,49.911   c-13.645-5.906-28.218-8.965-42.735-8.942c-27.402-0.044-55.123,10.554-76.021,31.487C10.554,333.054-0.044,360.775,0,388.177   c-0.044,27.39,10.554,55.112,31.476,76.021c20.92,20.931,48.641,31.519,76.032,31.485c27.412,0.034,55.112-10.564,76.01-31.475   l0.021-0.01c20.911-20.91,31.509-48.62,31.475-76.021c0.023-14.506-3.035-29.08-8.931-42.703l49.911-49.922l49.912,49.901   c-5.896,13.634-8.954,28.207-8.932,42.725c-0.033,27.401,10.566,55.112,31.498,76.01c20.898,20.921,48.598,31.53,76.01,31.496   c27.401,0.034,55.111-10.564,76.021-31.496c20.932-20.898,31.531-48.62,31.497-76.01   C512.034,360.765,501.436,333.054,480.503,312.156z M135.582,416.229c-7.839,7.805-17.808,11.581-28.075,11.625   c-10.278-0.044-20.226-3.82-28.064-11.625c-7.805-7.828-11.581-17.785-11.614-28.052c0.033-10.278,3.809-20.226,11.614-28.064   c7.828-7.805,17.786-11.581,28.064-11.614c10.277,0.044,20.224,3.809,28.064,11.614c7.805,7.828,11.569,17.786,11.613,28.064   c-0.044,10.267-3.808,20.224-11.624,28.063L135.582,416.229z M256.006,260.156c-9.417,0-17.046-7.628-17.046-17.045   c0-9.417,7.629-17.046,17.046-17.046c9.417,0,17.046,7.628,17.046,17.046C273.051,252.528,265.423,260.156,256.006,260.156z    M432.546,416.217c-7.838,7.816-17.796,11.592-28.063,11.626c-10.256-0.034-20.214-3.81-28.053-11.626   c-7.805-7.828-11.581-17.796-11.625-28.041c0.044-10.278,3.808-20.226,11.625-28.064c7.839-7.816,17.786-11.581,28.064-11.625   c10.256,0.034,20.214,3.808,28.052,11.625c7.805,7.839,11.581,17.797,11.625,28.064   C444.126,398.444,440.362,408.39,432.546,416.217z',
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
