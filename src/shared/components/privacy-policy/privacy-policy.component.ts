import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente de Política de Privacidad
 *
 * Este componente muestra la política de privacidad de CaliBarber,
 * incluyendo información sobre recolección, uso y protección de datos personales.
 * Diseñado con Tailwind CSS y Daisy UI para mantener consistencia visual.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent {
  
  /**
   * Fecha de última actualización de la política
   */
  lastUpdated = '15 de enero de 2025';

  /**
   * Información de contacto para consultas sobre privacidad
   */
  contactInfo = {
    email: 'privacidad@calibarber.com',
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