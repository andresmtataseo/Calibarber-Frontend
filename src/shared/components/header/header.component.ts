import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MobileSidebarComponent } from '../mobile-sidebar';
import { UrlService } from '../../../core/services/url.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserDto } from '../../../shared/models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileSidebarComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {

  /**
   * Configuración del componente
   */
  @Input() showAuthButtons: boolean = true;
  @Input() showUserDropdown: boolean = true;

  private urlService = inject(UrlService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Estado de autenticación reactivo
  isAuthenticated = false;
  currentUser: UserDto | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.isAuthenticated = authState.isAuthenticated;
        this.currentUser = authState.user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Estado del mobile sidebar
   */
  isMobileSidebarOpen: boolean = false;

  /**
   * Items del menú de navegación
   */
  navigationItems = [
    { label: 'INICIO', route: '/', active: true },
    { label: 'SERVICIOS', route: '/servicios', active: false },
    { label: 'EQUIPO', route: '/equipo', active: false },
    { label: 'GALERÍA', route: '/galeria', active: false },
    { label: 'NOSOTROS', route: '/nosotros', active: false },
    { label: 'CONTACTO', route: '/contacto', active: false }
  ];

  /**
   * Alterna el estado del mobile sidebar
   */
  toggleMobileMenu(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  /**
   * Cierra el mobile sidebar
   */
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  /**
   * Maneja el clic en un item del menú
   * @param item - Item del menú seleccionado
   */
  onMenuItemClick(item: any): void {
    // Actualizar el estado activo
    this.navigationItems.forEach(navItem => navItem.active = false);
    item.active = true;
  }

  /**
   * Maneja las acciones del dropdown del usuario
   * @param action - Acción seleccionada
   */
  onUserAction(action: string): void {
    switch (action) {
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      case 'settings':
        this.router.navigate(['/settings']);
        break;
      case 'logout':
        this.authService.signOut();
        this.router.navigate(['/']);
        break;
      default:
        console.log(`Acción no reconocida: ${action}`);
    }
  }

  /**
   * Maneja el clic en el botón de login
   */
  onLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Maneja el clic en el botón de registro
   */
  onRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Genera una URL de avatar usando el servicio centralizado
   */
  getAvatarUrl(name: string, size: number = 40): string {
    return this.urlService.generateAvatarUrl(name, '570df8', 'fff', size);
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(): string {
    return this.currentUser?.fullName || 'No disponible';
  }

  /**
   * Obtiene el email del usuario
   */
  getUserEmail(): string {
    return this.currentUser?.email || 'No disponible';
  }
}
