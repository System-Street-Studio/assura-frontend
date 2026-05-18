import { Routes } from '@angular/router';

export const reportingRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/reporting-dashboard').then((m) => m.ReportingDashboardComponent),
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./pages/audit-log/audit-log').then((m) => m.AuditLogComponent),
  },
  {
    path: 'assets',
    loadComponent: () => import('./pages/assets/reporting-assets').then((m) => m.ReportingAssetsComponent),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then((m) => m.ReportsComponent),
  },
  { path: 'export', redirectTo: 'reports', pathMatch: 'full' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
