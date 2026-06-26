import { Routes } from '@angular/router';

export const systemAdminRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
    },
    {
        path: 'master-data',
        loadComponent: () => import('./pages/master-data/master-data.component').then(m => m.MasterDataComponent)
    },
    {
        path: 'security',
        loadComponent: () => import('./pages/security/security.component').then(m => m.SecurityComponent)
    },
    {
        path: 'maintenance',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
    },
    {
        path: 'auditing',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
