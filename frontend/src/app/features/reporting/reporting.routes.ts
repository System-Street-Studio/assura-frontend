import { Routes } from '@angular/router';

export const reportingRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.ReportingDashboardComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
