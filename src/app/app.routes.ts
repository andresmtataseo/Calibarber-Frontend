import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Inicio - CaliBarber'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - CaliBarber'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
