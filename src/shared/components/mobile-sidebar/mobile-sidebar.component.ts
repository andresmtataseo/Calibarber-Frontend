import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  /**
   * Props de entrada del componente
   */
  @Input() isOpen: boolean = false;
  @Input() isAuthenticated: boolean = false;
  @Input() currentUser: any = null;
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
}