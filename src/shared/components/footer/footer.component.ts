import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente Footer reutilizable
 *
 * Este componente implementa el pie de página de la aplicación
 * siguiendo el diseño de DaisyUI. Incluye:
 * - Información de la empresa CaliBarber
 * - Información de contacto y ubicación
 * - Horarios de atención
 * - Enlaces a políticas y términos legales
 * - Diseño responsive con Daisy UI y Tailwind CSS
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  /**
   * Año actual para el copyright
   */
  currentYear = new Date().getFullYear();

  /**
   * Información de contacto de la empresa
   */
  contactInfo = {
    name: 'Calibarber Barbershop',
    address: '123 Calle Principal, Fort Lauderdale, Florida',
    phone: '+1 (555) 123-4567',
    email: 'info@calibarber.com'
  };

  /**
   * Horarios de atención
   */
  scheduleInfo = {
    weekdays: 'Lunes a Viernes: 9:00 AM - 7:00 PM',
    saturday: 'Sábados: 9:00 AM - 5:00 PM',
    sunday: 'Domingos: Cerrado'
  };

  /**
   * Enlaces de servicios
   */
  serviceLinks = [
    { label: 'Cortes de cabello', route: '/servicios/cortes' },
    { label: 'Afeitado', route: '/servicios/afeitado' },
    { label: 'Barba y bigote', route: '/servicios/barba' },
    { label: 'Tratamientos', route: '/servicios/tratamientos' }
  ];

  /**
   * Enlaces de la empresa
   */
  companyLinks = [
    { label: 'Nosotros', route: '/nosotros' },
    { label: 'Equipo', route: '/equipo' },
    { label: 'Galería', route: '/galeria' },
    { label: 'Contacto', route: '/contacto' }
  ];

  /**
   * Enlaces legales
   */
  legalLinks = [
    { label: 'Términos y condiciones', route: '/terminos' },
    { label: 'Política de privacidad', route: '/privacidad' },
    { label: 'Política de reembolso', route: '/reembolso' },
    { label: 'FAQ', route: '/faq' }
  ];

  /**
   * Maneja el click en los enlaces del footer
   */
  onLinkClick(route: string): void {
    // La navegación se maneja automáticamente por RouterModule
    console.log(`Navegando a: ${route}`);
  }

  /**
   * Maneja el click en redes sociales
   */
  onSocialClick(platform: string): void {
    switch (platform) {
      case 'instagram':
        window.open('https://instagram.com/calibarber', '_blank');
        break;
      case 'facebook':
        window.open('https://facebook.com/calibarber', '_blank');
        break;
      case 'twitter':
        window.open('https://twitter.com/calibarber', '_blank');
        break;
    }
  }
}
