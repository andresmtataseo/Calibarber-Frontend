import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente Header reutilizable
 * 
 * Este componente implementa la barra de navegación principal de la aplicación
 * siguiendo el diseño proporcionado. Incluye:
 * - Logo de la empresa
 * - Menú de navegación principal
 * - Información del usuario logueado
 * - Diseño responsive con Daisy UI y Tailwind CSS
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  
  /**
   * Configuración del componente
   */
  @Input() isAuthenticated: boolean = false; // Por defecto false para mostrar botones de auth
  @Input() showAuthButtons: boolean = true;
  @Input() showUserDropdown: boolean = true;

  /**
   * Información del usuario actual
   * En una implementación real, esto vendría del servicio de autenticación
   */
  currentUser = {
    name: 'Jose Perez',
    email: 'josep@mail.com',
    avatar: undefined as string | undefined
  };

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
   * Función placeholder para el botón hamburguesa
   * Se utilizará para activar el sidebar en el futuro
   */
  toggleMobileMenu(): void {
    // TODO: Implementar funcionalidad del sidebar
    console.log('Botón hamburguesa presionado - Sidebar pendiente de implementación');
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
        // Navegar al perfil
        console.log('Ir al perfil');
        break;
      case 'settings':
        // Navegar a configuración
        console.log('Ir a configuración');
        break;
      case 'logout':
        // Cerrar sesión
        console.log('Cerrar sesión');
        break;
    }
  }

  /**
   * Maneja el clic en el botón de login
   */
  onLogin(): void {
    // TODO: Implementar navegación a login o abrir modal
    console.log('Ir a login');
  }

  /**
   * Maneja el clic en el botón de registro
   */
  onRegister(): void {
    // TODO: Implementar navegación a registro o abrir modal
    console.log('Ir a registro');
  }
}