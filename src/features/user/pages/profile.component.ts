import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse } from '../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Datos de ejemplo del usuario - en una implementación real vendrían de un servicio
  user: UserResponse = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'jose@email.com',
    role: 'CLIENT' as any,
    firstName: 'Jose',
    lastName: 'Perez',
    phoneNumber: '+1234567890',
    isActive: true,
    profilePictureUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  };

  constructor() { }

  ngOnInit(): void {
    // Aquí se cargarían los datos del usuario desde un servicio
  }

  /**
   * Obtiene la URL del avatar usando un servicio de avatares
   */
  getAvatarUrl(name: string, size: number = 40): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=0D8ABC&color=fff`;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  /**
   * Formatea la fecha de creación de la cuenta
   */
  getFormattedCreatedDate(): string {
    return new Date(this.user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}