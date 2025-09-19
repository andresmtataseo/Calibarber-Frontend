import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarberResponse } from '../models/barber.model';
import { UserResponse } from '../../user/models/user.model';
import { UserService } from '../../user/services/user.service';
import { UrlService } from '../../../core/services/url.service';

@Component({
  selector: 'app-barber-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barber-card.component.html'
})
export class BarberCardComponent implements OnInit {
  @Input({ required: true }) barber!: BarberResponse;
  @Output() barberSelected = new EventEmitter<BarberResponse>();

  user: UserResponse | null = null;
  loading = true;
  error: string | null = null;

  private readonly userService = inject(UserService);
  private readonly urlService = inject(UrlService);

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    if (!this.barber?.userId) {
      this.loading = false;
      this.error = 'No se encontró información del usuario';
      return;
    }

    this.userService.getUserById(this.barber.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.error = null;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.error = 'Error al cargar datos del usuario';
        this.loading = false;
      }
    });
  }

  onSelectBarber(): void {
    this.barberSelected.emit(this.barber);
  }

  get displayName(): string {
    if (this.user) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return `Barbero ${this.barber.barberId}`;
  }

  get profileImage(): string {
    if (this.user?.profilePictureUrl) {
      return this.user.profilePictureUrl;
    }
    // Generar avatar usando el servicio UrlService
    const name = this.displayName;
    return this.urlService.generateAvatarUrl(name);
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, generar avatar con el nombre del barbero
    const name = this.displayName;
    event.target.src = this.urlService.generateAvatarUrl(name);
  }
}
