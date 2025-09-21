import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home';
import { LoginComponent } from '../features/auth/pages';
import { RegisterComponent } from '../features/auth/pages/register';
import { ForgotPasswordComponent } from '../features/auth/pages/forgot-password';
import { ResetPasswordComponent } from '../features/auth/pages/reset-password';
import { ChangePasswordComponent } from '../features/auth/pages/change-password';
import { ProfileComponent } from '../features/user/pages/profile/profile.component';
import { EditProfileComponent } from '../features/user/pages/edit-profile/edit-profile.component';
import { AdminDashboardComponent } from '../features/admin/pages/admin-dashboard/admin-dashboard.component';
import { DashboardHomeComponent } from '../features/admin/pages/dashboard-home/dashboard-home.component';
import { PrivacyPolicyComponent } from '../shared/components/privacy-policy';
import { TermsOfServiceComponent } from '../shared/components/terms-of-service';
import { guestGuard, authGuard, adminGuard } from '../core/guards/auth.guard';

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
    path: 'auth/change-password',
    component: ChangePasswordComponent,
    title: 'Cambiar Contraseña - CaliBarber',
    canActivate: [authGuard]
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
    path: 'book-appointment',
    loadComponent: () => import('../features/appointment/pages/book-appointment.component').then(m => m.BookAppointmentComponent),
    title: 'Reservar Cita - CaliBarber',
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    title: 'Panel de Administración - CaliBarber',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
        title: 'Dashboard - CaliBarber'
      },
      {
        path: 'users',
        loadChildren: () => import('../features/admin/pages/users/users.routes').then(m => m.usersRoutes)
      },
      {
        path: 'barbers',
        loadChildren: () => import('../features/admin/pages/barbers/barbers.routes').then(m => m.barbersRoutes)
      },
      {
        path: 'barbershops',
        loadChildren: () => import('../features/admin/pages/barbershops/barbershops.routes').then(m => m.barbershopsRoutes)
      },
      {
        path: 'appointments',
        loadChildren: () => import('../features/admin/pages/appointments/appointments.routes').then(m => m.appointmentsRoutes)
      },
      {
        path: 'services',
        loadChildren: () => import('../features/admin/pages/services/services.routes').then(m => m.servicesRoutes)
      },
      {
        path: 'payments',
        loadChildren: () => import('../features/admin/pages/payments/payments.routes').then(m => m.paymentsRoutes)
      }
    ]
  },
  {
    path: 'privacidad',
    component: PrivacyPolicyComponent,
    title: 'Política de Privacidad - CaliBarber'
  },
  {
    path: 'terminos',
    component: TermsOfServiceComponent,
    title: 'Términos y Condiciones - CaliBarber'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
