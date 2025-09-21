import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente de Términos y Condiciones
 *
 * Este componente muestra los términos y condiciones de uso de CaliBarber,
 * incluyendo reglas de uso, responsabilidades y limitaciones.
 * Diseñado con Tailwind CSS y Daisy UI para mantener consistencia visual.
 */
@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.css']
})
export class TermsOfServiceComponent {

  /**
   * Fecha de última actualización de los términos
   */
  lastUpdated = '15 de enero de 2025';

  /**
   * Información de contacto para consultas legales
   */
  contactInfo = {
    email: 'legal@calibarber.com',
    phone: '+57 (123) 456-7890',
    address: 'Cali, Valle del Cauca, Colombia'
  };

  /**
   * Navega hacia arriba de la página
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navega a una sección específica de la página
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
