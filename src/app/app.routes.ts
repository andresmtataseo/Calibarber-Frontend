import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';
import { RegisterComponent } from '../features/auth/pages/register';
import { ForgotPasswordComponent } from '../features/auth/pages/forgot-password';

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
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Restablecer Contraseña - CaliBarber'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
