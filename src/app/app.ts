import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, FooterComponent } from '../shared/components';
import { NotificationContainerComponent } from '../shared/components/notification/notification-container.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Validar token automáticamente al iniciar la aplicación
    this.validateTokenOnStartup();
  }

  /**
   * Valida el token almacenado al iniciar la aplicación
   */
  private validateTokenOnStartup(): void {
    const token = this.authService.getToken();

    if (token) {
      // Si hay token, verificar su validez con el backend
      this.authService.checkAuth().subscribe({
        next: (response) => {
          // Token válido, el estado ya se actualiza automáticamente en AuthService
          console.log('Token válido, usuario autenticado');
        },
        error: (error) => {
          // Solo limpiar sesión si es un error de autenticación (401/403)
          // No limpiar por errores de conectividad
          if (error.status === 401 || error.status === 403) {
            console.warn('Token inválido o expirado:', error);
            this.authService.signOut();
          } else {
            console.warn('Error de conectividad al validar token, manteniendo sesión local:', error);
            // Mantener la sesión local si es solo un problema de conectividad
          }
        }
      });
    }
  }
}
