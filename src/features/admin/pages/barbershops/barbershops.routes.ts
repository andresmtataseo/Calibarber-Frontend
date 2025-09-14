import { Routes } from '@angular/router';
import { BarbershopCreateComponent } from './barbershop-create/barbershop-create.component';
import { BarbershopEditComponent } from './barbershop-edit/barbershop-edit.component';
import { BarbershopViewComponent } from './barbershop-view/barbershop-view.component';

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
    path: 'view/:id',
    component: BarbershopViewComponent,
    title: 'Ver Barbería - CaliBarber'
  },
  {
    path: 'edit/:id',
    component: BarbershopEditComponent,
    title: 'Editar Barbería - CaliBarber'
  }
];