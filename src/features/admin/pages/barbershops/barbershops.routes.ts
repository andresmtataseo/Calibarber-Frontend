import { Routes } from '@angular/router';
import { BarbershopCreateComponent } from './barbershop-create/barbershop-create.component';
import { BarbershopEditComponent } from './barbershop-edit/barbershop-edit.component';

export const barbershopsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./barbershop-list/barbershop-list.component').then(m => m.BarbershopListComponent),
    title: 'Lista de Barberías - CaliBarber'
  },
  {
    path: 'create',
    component: BarbershopCreateComponent,
    title: 'Crear Barbería - CaliBarber'
  },
  {
    path: 'edit/:id',
    component: BarbershopEditComponent,
    title: 'Editar Barbería - CaliBarber'
  }
];