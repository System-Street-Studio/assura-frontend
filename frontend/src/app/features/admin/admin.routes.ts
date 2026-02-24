import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'my-assets',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) // Stub
    },
    {
        path: 'track-assets',
        loadComponent: () => import('./pages/track-assets/track-assets').then(m => m.TrackAssetsComponent)
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
