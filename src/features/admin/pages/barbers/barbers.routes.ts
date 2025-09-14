import { Routes } from '@angular/router';
import { BarberCreateComponent } from './barber-create/barber-create.component';
import { BarberEditComponent } from './barber-edit/barber-edit.component';

export const barbersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./barber-list/barber-list.component').then(m => m.BarberListComponent),
    title: 'Lista de Barberos - CaliBarber'
  },
  {
    path: 'create',
    component: BarberCreateComponent,
    title: 'Crear Barbero - CaliBarber'
  },
  {
    path: 'edit/:id',
    component: BarberEditComponent,
    title: 'Editar Barbero - CaliBarber'
  }
];