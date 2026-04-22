import { Routes } from '@angular/router';

export const reportingRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.ReportingDashboardComponent),
  },
  {
    path: 'asset',
    loadComponent: () => import('./asset/asset').then((m) => m.ReportingAssetComponent),
  },
  {
    path: 'report',
    loadComponent: () => import('./report/report').then((m) => m.ReportingReportComponent),
  },
  {
    path: 'auditlog',
    loadComponent: () => import('./auditlog/auditlog').then((m) => m.ReportingAuditlogComponent),
  },
  { path: 'reports', redirectTo: 'report', pathMatch: 'full' },
  { path: 'audit-logs', redirectTo: 'auditlog', pathMatch: 'full' },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
