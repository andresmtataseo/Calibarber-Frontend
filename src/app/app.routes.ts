import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';
import { RegisterComponent } from '../features/auth/pages/register';
import { ForgotPasswordComponent } from '../features/auth/pages/forgot-password';
import { ResetPasswordComponent } from '../features/auth/pages/reset-password';
import { ProfileComponent } from '../features/user/pages/profile/profile.component';
import { EditProfileComponent } from '../features/user/pages/edit-profile/edit-profile.component';
import { guestGuard, authGuard } from '../core/guards/auth.guard';

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
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Nueva Contraseña - CaliBarber',
    canActivate: [guestGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Perfil - CaliBarber',
    canActivate: [authGuard]
  },
  {
    path: 'user/edit-profile',
    component: EditProfileComponent,
    title: 'Editar Perfil - CaliBarber',
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
