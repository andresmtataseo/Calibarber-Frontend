import { Routes } from '@angular/router';
import { authGuard, adminGuard } from '../../../../core/guards/auth.guard';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
    title: 'Lista de Citas - CaliBarber',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./appointment-create/appointment-create.component').then(m => m.AppointmentCreateComponent),
    title: 'Crear Cita - CaliBarber',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./appointment-edit/appointment-edit.component').then(m => m.AppointmentEditComponent),
    title: 'Editar Cita - CaliBarber',
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./appointment-view/appointment-view.component').then(m => m.AppointmentViewComponent),
    title: 'Ver Cita - CaliBarber',
    canActivate: [authGuard, adminGuard]
  }
];
