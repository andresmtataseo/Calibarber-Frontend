import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UrlService } from '../../../core/services/url.service';
import { UserService } from '../../../features/user/services/user.service';
import { UserDto } from '../../../shared/models/auth.models';
import { UserResponse } from '../../../features/user/models/user.model';

/**
 * Componente Mobile Sidebar
 *
 * Barra lateral responsiva que se activa exclusivamente en dispositivos móviles.
 * Implementa el patrón drawer de DaisyUI con animaciones suaves y controles táctiles.
 * Se integra con el componente Header para mostrar la navegación en pantallas pequeñas.
 */
@Component({
  selector: 'app-mobile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-sidebar.component.html'
})
export class MobileSidebarComponent implements OnInit, OnDestroy, OnChanges {

  private urlService = inject(UrlService);
  private userService = inject(UserService);
  private destroy$ = new Subject<void>();

  userProfile: UserResponse | null = null;

  /**
   * Props de entrada del componente
   */
  @Input() isOpen: boolean = false;
  @Input() isAuthenticated: boolean = false;
  @Input() currentUser: UserDto | null = null;
  @Input() navigationItems: any[] = [];

  /**
   * Eventos de salida
   */
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<any>();
  @Output() userAction = new EventEmitter<string>();
  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();

  ngOnInit(): void {
    // Cargar perfil si ya hay un usuario autenticado
    if (this.isAuthenticated && this.currentUser?.id) {
      this.loadUserProfile(this.currentUser.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en el usuario actual
    if (changes['currentUser'] || changes['isAuthenticated']) {
      if (this.isAuthenticated && this.currentUser?.id) {
        this.loadUserProfile(this.currentUser.id);
      } else {
        this.userProfile = null;
      }
    }
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
          console.warn('Error al cargar perfil del usuario en mobile-sidebar:', error);
          this.userProfile = null;
        }
      });
  }

  /**
   * Cierra el drawer
   */
  onCloseDrawer(): void {
    this.closeDrawer.emit();
  }

  /**
   * Maneja el click en un item del menú
   */
  onMenuItemClick(item: any): void {
    this.menuItemClick.emit(item);
    this.onCloseDrawer(); // Cierra el drawer después de navegar
  }

  /**
   * Maneja las acciones del usuario
   */
  onUserAction(action: string): void {
    this.userAction.emit(action);
    this.onCloseDrawer(); // Cierra el drawer después de la acción
  }

  /**
   * Maneja el click en login
   */
  onLogin(): void {
    this.loginClick.emit();
    this.onCloseDrawer();
  }

  /**
   * Maneja el click en register
   */
  onRegister(): void {
    this.registerClick.emit();
    this.onCloseDrawer();
  }

  /**
   * Maneja el click en el overlay para cerrar el drawer
   */
  onOverlayClick(): void {
    this.onCloseDrawer();
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
  getAvatarUrl(name: string, size: number = 48): string {
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
