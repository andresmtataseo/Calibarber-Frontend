import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceResponseDto } from '../../../shared/models/service.models';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html'
})
export class ServiceCardComponent {
  @Input() service!: ServiceResponseDto;

  constructor(private router: Router) { }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${remainingMinutes} min`;
  }

  formatPrice(price: number): string {
    return `$ ${price.toFixed(2)}`;
  }

  /**
   * Navega a la página de reserva de citas
   */
  navigateToBookAppointment(): void {
    this.router.navigate(['/book-appointment']);
  }
}
