import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';
import { RegisterComponent } from '../features/auth/pages/register';
import { ForgotPasswordComponent } from '../features/auth/pages/forgot-password';
import { guestGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Inicio - CaliBarber'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - CaliBarber',
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registro - CaliBarber',
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Restablecer Contraseña - CaliBarber',
    canActivate: [guestGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
