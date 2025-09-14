import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'Cliente',
      status: 'Activo',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria@example.com',
      role: 'Barbero',
      status: 'Activo',
      createdAt: '2024-01-10'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargar usuarios desde el servicio
  }

  createUser(): void {
    this.router.navigate(['/admin/users/create']);
  }

  editUser(userId: string): void {
    this.router.navigate(['/admin/users/edit', userId]);
  }

  deleteUser(userId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      // Lógica para eliminar usuario
      console.log('Eliminando usuario:', userId);
    }
  }
}