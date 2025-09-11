import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente Home - Página de inicio
 *
 * Este componente implementa la página principal de CaliBarber
 * con secciones atractivas para el usuario:
 * - Hero section con llamada a la acción
 * - Información destacada de servicios
 * - Diseño responsive con DaisyUI y Tailwind CSS
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  /**
   * Información del hero section
   */
  heroContent = {
    title: 'Estilo que trasciende, elegancia que perdura',
  };
}
