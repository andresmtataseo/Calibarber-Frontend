import { Routes } from '@angular/router';

export const paymentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./payment-list/payment-list.component').then(m => m.PaymentListComponent),
    title: 'Lista de Pagos - CaliBarber'
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./payment-details/payment-details.component').then(m => m.PaymentDetailsComponent),
    title: 'Detalles de Pago - CaliBarber'
  }
];