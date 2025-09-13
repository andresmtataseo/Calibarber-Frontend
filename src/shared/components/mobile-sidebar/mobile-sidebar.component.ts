import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UrlService } from '../../../core/services/url.service';
import { UserDto } from '../../../shared/models/auth.models';

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
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.css']
})
export class MobileSidebarComponent {

  private urlService = inject(UrlService);

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
}
