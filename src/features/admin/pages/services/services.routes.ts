import { Routes } from '@angular/router';

export const servicesRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./service-list/service-list.component').then(m => m.ServiceListComponent),
    title: 'Lista de Servicios - CaliBarber'
  },
  {
    path: 'create',
    loadComponent: () => import('./service-create/service-create.component').then(m => m.ServiceCreateComponent),
    title: 'Crear Servicio - CaliBarber'
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./service-view/service-view.component').then(m => m.ServiceViewComponent),
    title: 'Detalles del Servicio - CaliBarber'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./service-edit/service-edit.component').then(m => m.ServiceEditComponent),
    title: 'Editar Servicio - CaliBarber'
  }
];