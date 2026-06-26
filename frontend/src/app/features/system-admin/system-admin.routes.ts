import { Routes } from '@angular/router';

export const systemAdminRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
    },
    // Placeholders for the other sections. These can be implemented later.
    {
        path: 'master-data',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
    },
    {
        path: 'security',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.SystemAdminDashboardComponent)
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
