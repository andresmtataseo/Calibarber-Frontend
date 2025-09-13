import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UrlService } from '../../../core/services/url.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly urlService = inject(UrlService);
  
  user: UserResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor() { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Carga el perfil del usuario actual
   */
  private loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    // Obtener el usuario actual del estado de autenticación
    this.authService.authState$.subscribe({
      next: (authState) => {
        if (authState.user?.id) {
          this.loadUserById(authState.user.id);
        } else {
          this.error = 'No se pudo obtener la información del usuario autenticado';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Error al obtener el estado de autenticación';
        this.loading = false;
        console.error('Error en authState:', error);
      }
    });
  }

  /**
   * Carga los datos de un usuario específico
   */
  private loadUserById(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        console.log('Usuario cargado exitosamente:', user);
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar el perfil del usuario';
        this.loading = false;
        console.error('Error al cargar usuario:', error);
      }
    });
  }

  /**
   * Recarga el perfil del usuario
   */
  reloadProfile(): void {
    this.loadUserProfile();
  }

  /**
   * Obtiene la URL del avatar del usuario
   * Si no tiene imagen, genera un avatar usando el servicio centralizado
   */
  getAvatarUrl(): string {
    if (this.user?.profilePictureUrl) {
      return this.user.profilePictureUrl;
    }
    
    const fullName = this.getUserFullName();
    return fullName ? this.urlService.generateAvatarUrl(fullName, '570df8', 'fff', 96) : 'assets/images/default-avatar.png';
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  /**
   * Formatea la fecha de creación de la cuenta
   */
  getFormattedCreatedDate(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}