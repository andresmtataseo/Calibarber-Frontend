import { Routes } from '@angular/router';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserEditComponent } from './user-edit/user-edit.component';

export const usersRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
    title: 'Lista de Usuarios - CaliBarber'
  },
  {
    path: 'create',
    component: UserCreateComponent,
    title: 'Crear Usuario - CaliBarber'
  },
  {
    path: 'edit/:id',
    component: UserEditComponent,
    title: 'Editar Usuario - CaliBarber'
  }
];