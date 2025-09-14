import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent {

  constructor(private router: Router) {}

  /**
   * Navega a la ruta especificada
   * @param route - Ruta a la que navegar
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}