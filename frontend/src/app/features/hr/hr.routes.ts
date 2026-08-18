import { Routes } from '@angular/router';

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
        path: 'activity-logs',
        loadComponent: () => import('./pages/activity-log/activity-log').then((m) => m.HrActivityLogComponent),
    },
    {
        path: 'assign-role',
        loadComponent: () => import('./pages/form/form').then((m) => m.HrAssignRoleFormComponent),
    },
    { path: '', redirectTo: 'overview', pathMatch: 'full' }
];
