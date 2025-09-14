import { Routes } from '@angular/router';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
    title: 'Lista de Citas - CaliBarber'
  },
  {
    path: 'create',
    loadComponent: () => import('./appointment-create/appointment-create.component').then(m => m.AppointmentCreateComponent),
    title: 'Crear Cita - CaliBarber'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./appointment-edit/appointment-edit.component').then(m => m.AppointmentEditComponent),
    title: 'Editar Cita - CaliBarber'
  }
];