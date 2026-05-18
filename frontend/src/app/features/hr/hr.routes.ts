import { Routes } from '@angular/router';

// Lazy HR routes keep each page in its own bundle until the user opens that screen.
export const hrRoutes: Routes = [
    {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview').then((m) => m.HrOverviewComponent),
    },
    {
        path: 'pending',
        loadComponent: () => import('./pages/pending/pending').then((m) => m.HrPendingComponent),
    },
    {
        path: 'assigned',
        loadComponent: () => import('./pages/assigned/assigned').then((m) => m.HrAssignedComponent),
    },
    {
        path: 'my-assets',
        loadComponent: () => import('./pages/myasset/myasset').then((m) => m.HrMyAssetComponent),
    },
    {
        path: 'assign-role',
        loadComponent: () => import('./pages/form/form').then((m) => m.HrAssignRoleFormComponent),
    },
    // Opening /hr without a child page should land on the HR dashboard by default.
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
