import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';
import { RegisterComponent } from '../features/auth/pages/register';

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
    path: 'register',
    component: RegisterComponent,
    title: 'Registro - CaliBarber'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
