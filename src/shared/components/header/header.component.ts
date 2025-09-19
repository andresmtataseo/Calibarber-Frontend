import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MobileSidebarComponent } from '../mobile-sidebar';
import { UrlService } from '../../../core/services/url.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../features/user/services/user.service';
import { UserDto } from '../../../shared/models/auth.models';
import { UserResponse } from '../../../features/user/models/user.model';

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
  private userService = inject(UserService);
  private viewportScroller = inject(ViewportScroller);
  private destroy$ = new Subject<void>();

  // Estado de autenticación reactivo
  isAuthenticated = false;
  currentUser: UserDto | null = null;
  userProfile: UserResponse | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.isAuthenticated = authState.isAuthenticated;
        this.currentUser = authState.user;
        
        // Cargar perfil completo del usuario si está autenticado
        if (authState.isAuthenticated && authState.user?.id) {
          this.loadUserProfile(authState.user.id);
        } else {
          this.userProfile = null;
        }
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
    { label: 'INICIO', route: '/', fragment: '', active: true },
    { label: 'SERVICIOS', route: '/', fragment: 'servicios', active: false },
    { label: 'EQUIPO', route: '/', fragment: 'equipo', active: false },
    { label: 'GALERÍA', route: '/', fragment: 'galeria', active: false },
    { label: 'NOSOTROS', route: '/', fragment: 'nosotros', active: false },
    { label: 'CONTACTO', route: '/', fragment: 'contacto', active: false }
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
    
    // Navegar con fragment si existe
    if (item.fragment) {
      this.router.navigate([item.route], { fragment: item.fragment }).then(() => {
        // Usar ViewportScroller como respaldo para asegurar el scroll
        setTimeout(() => {
          this.viewportScroller.scrollToAnchor(item.fragment);
        }, 100);
      });
    } else {
      this.router.navigate([item.route]).then(() => {
        // Scroll al top para la página de inicio
        this.viewportScroller.scrollToPosition([0, 0]);
      });
    }
    
    // Cerrar el menú móvil si está abierto
    this.closeMobileSidebar();
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
      case 'admin':
        this.router.navigate(['/admin']);
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
   * Carga el perfil completo del usuario
   */
  private loadUserProfile(userId: string): void {
    this.userService.getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userProfile) => {
          this.userProfile = userProfile;
        },
        error: (error) => {
          console.warn('Error al cargar perfil del usuario:', error);
          this.userProfile = null;
        }
      });
  }

  /**
   * Obtiene la URL del avatar del usuario
   * Primero intenta usar la foto de perfil, luego genera un avatar
   */
  getUserAvatarUrl(size: number = 48): string {
    // Intentar usar la foto de perfil del usuario
    if (this.userProfile?.profilePictureUrl) {
      return this.userProfile.profilePictureUrl;
    }
    
    // Fallback: generar avatar usando el servicio centralizado
    const fullName = this.getUserFullName();
    return this.urlService.generateAvatarUrl(fullName, '570df8', 'fff', size);
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

  /**
   * Verifica si el usuario actual es administrador
   */
  isUserAdmin(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }
}
